'use client'

import { useState, useEffect } from 'react'
import styles from './inventory.module.css'

export default function InventoryAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [sessionExpiry, setSessionExpiry] = useState(null)
  const [products, setProducts] = useState([])
  const [localChanges, setLocalChanges] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loginAttempts, setLoginAttempts] = useState(0)

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminSessionToken')
    const savedExpiry = sessionStorage.getItem('adminSessionExpiry')
    
    if (savedToken && savedExpiry) {
      const expiryDate = new Date(savedExpiry)
      if (expiryDate > new Date()) {
        setIsAuthenticated(true)
        setSessionToken(savedToken)
        setSessionExpiry(expiryDate)
        fetchInventory(savedToken)
        
        // Set up auto-refresh timer
        setupSessionTimer(expiryDate)
      } else {
        // Session expired, clean up
        sessionStorage.removeItem('adminSessionToken')
        sessionStorage.removeItem('adminSessionExpiry')
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      const interval = setInterval(() => {
        fetchInventory(sessionToken)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, sessionToken])

  const setupSessionTimer = (expiryDate) => {
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()
    
    if (timeUntilExpiry > 0) {
      // Auto-logout 5 minutes before expiry
      const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000)
      
      setTimeout(() => {
        setError('Sua sessão expirará em 5 minutos. Salve suas alterações.')
      }, warningTime)
      
      // Auto-logout at expiry
      setTimeout(() => {
        handleLogout()
      }, timeUntilExpiry)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error)
          setLoginAttempts(prev => prev + 1)
        } else {
          setError(data.error || 'Erro de autenticação')
          setLoginAttempts(prev => prev + 1)
        }
        return
      }
      
      // Success
      const expiryDate = new Date(data.expiresAt)
      setIsAuthenticated(true)
      setSessionToken(data.sessionToken)
      setSessionExpiry(expiryDate)
      setLoginAttempts(0)
      
      // Store in session storage
      sessionStorage.setItem('adminSessionToken', data.sessionToken)
      sessionStorage.setItem('adminSessionExpiry', data.expiresAt)
      
      // Set up session timer
      setupSessionTimer(expiryDate)
      
      // Fetch inventory
      fetchInventory(data.sessionToken)
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/admin/auth', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clean up regardless of API call result
      setIsAuthenticated(false)
      setSessionToken('')
      setSessionExpiry(null)
      setPassword('')
      setLocalChanges({})
      sessionStorage.removeItem('adminSessionToken')
      sessionStorage.removeItem('adminSessionExpiry')
    }
  }

  const fetchInventory = async (token) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (response.status === 401) {
        handleLogout()
        setError('Sessão expirada. Faça login novamente.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Erro ao buscar inventário')
      }
      
      const data = await response.json()
      setProducts(data.products)
      setLastUpdated(new Date().toLocaleString('pt-BR'))
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Erro de conexão. Verifique sua internet.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateLocalInventory = (inventoryId, newQuantity) => {
    setLocalChanges(prev => ({
      ...prev,
      [inventoryId]: Math.max(0, parseInt(newQuantity) || 0)
    }))
  }

  const adjustLocalInventory = (inventoryId, amount) => {
    const currentQuantity = getCurrentQuantity(inventoryId)
    const newQuantity = Math.max(0, currentQuantity + amount)
    updateLocalInventory(inventoryId, newQuantity)
  }

  const getCurrentQuantity = (inventoryId) => {
    if (inventoryId in localChanges) {
      return localChanges[inventoryId]
    }
    const product = products.find(p => p.inventoryId === inventoryId)
    return product ? product.quantity : 0
  }

  const getDisplayedProducts = () => {
    return products.map(product => ({
      ...product,
      quantity: getCurrentQuantity(product.inventoryId),
      hasChanges: product.inventoryId in localChanges
    }))
  }

  const hasUnsavedChanges = () => {
    return Object.keys(localChanges).length > 0
  }

  const saveChanges = async () => {
    if (!hasUnsavedChanges()) return
    
    setError('')
    setSuccess('')
    setSaving(true)
    
    try {
      const updates = Object.entries(localChanges).map(([inventoryId, quantity]) => ({
        inventoryId,
        quantity
      }))
      
      for (const update of updates) {
        const response = await fetch('/api/admin/inventory', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(update)
        })
        
        if (response.status === 401) {
          handleLogout()
          setError('Sessão expirada. Faça login novamente.')
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Erro ao atualizar ${update.inventoryId}`)
        }
      }
      
      setSuccess(`${updates.length} produto(s) atualizado(s) com sucesso`)
      setLocalChanges({})
      fetchInventory(sessionToken)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelChanges = () => {
    setLocalChanges({})
    setError('')
    setSuccess('')
  }

  const syncProducts = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/inventory/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (response.status === 401) {
        handleLogout()
        setError('Sessão expirada. Faça login novamente.')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao sincronizar produtos')
      }
      
      const data = await response.json()
      setSuccess(data.message)
      fetchInventory(sessionToken)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (inventoryId, newQuantity) => {
    updateLocalInventory(inventoryId, newQuantity)
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authForm}>
          <h1>Acesso Administrativo</h1>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.passwordInput}
              required
            />
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
          {loginAttempts > 0 && (
            <div className={styles.warningText}>
              Tentativas de login: {loginAttempts}/5
              {loginAttempts >= 3 && (
                <div>Após 5 tentativas, você será bloqueado por 1 hora.</div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Gerenciamento de Estoque</h1>
          {sessionExpiry && (
            <div className={styles.sessionInfo}>
              Sessão expira em: {sessionExpiry.toLocaleString('pt-BR')}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          {hasUnsavedChanges() && (
            <>
              <button 
                onClick={saveChanges}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button 
                onClick={cancelChanges}
                disabled={saving}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </>
          )}
          <button 
            onClick={() => syncProducts()} 
            disabled={loading || saving}
            className={styles.syncButton}
          >
            Sincronizar Produtos
          </button>
          <button 
            onClick={() => fetchInventory(sessionToken)} 
            disabled={loading || saving}
            className={styles.refreshButton}
          >
            Atualizar
          </button>
          <button 
            onClick={handleLogout}
            disabled={loading || saving}
            className={styles.logoutButton}
          >
            Sair
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      
      {hasUnsavedChanges() && (
        <div className={styles.unsavedWarning}>
          Você tem alterações não salvas. Clique em &ldquo;Salvar&rdquo; para aplicar as mudanças.
        </div>
      )}
      
      {lastUpdated && (
        <div className={styles.lastUpdated}>
          Última atualização: {lastUpdated}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Estoque Atual</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {getDisplayedProducts().map((product) => (
                <tr key={product.inventoryId} className={product.hasChanges ? styles.hasChanges : ''}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.inventoryId, e.target.value)}
                      className={`${styles.quantityInput} ${product.hasChanges ? styles.modified : ''}`}
                      min="0"
                      disabled={saving}
                    />
                  </td>
                  <td>
                    <span className={product.quantity > 0 ? styles.available : styles.soldOut}>
                      {product.quantity > 0 ? 'Disponível' : 'Esgotado'}
                    </span>
                  </td>
                  <td className={styles.actionButtons}>
                    <button
                      onClick={() => adjustLocalInventory(product.inventoryId, 10)}
                      className={styles.actionButton}
                      title="Adicionar 10"
                      disabled={saving}
                    >
                      +10
                    </button>
                    <button
                      onClick={() => adjustLocalInventory(product.inventoryId, 1)}
                      className={styles.actionButton}
                      title="Adicionar 1"
                      disabled={saving}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustLocalInventory(product.inventoryId, -1)}
                      className={styles.actionButton}
                      title="Remover 1"
                      disabled={product.quantity === 0 || saving}
                    >
                      -1
                    </button>
                    <button
                      onClick={() => adjustLocalInventory(product.inventoryId, -10)}
                      className={styles.actionButton}
                      title="Remover 10"
                      disabled={product.quantity < 10 || saving}
                    >
                      -10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}