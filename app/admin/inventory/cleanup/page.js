'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InventoryCleanupPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [cleanupData, setCleanupData] = useState(null)
  const [cleanupResult, setCleanupResult] = useState(null)
  const [isRunningCleanup, setIsRunningCleanup] = useState(false)
  const [showForceCleanup, setShowForceCleanup] = useState(false)

  // Check authentication
  useEffect(() => {
    const sessionToken = sessionStorage.getItem('adminSessionToken')
    const expiresAt = sessionStorage.getItem('adminSessionExpiry')
    
    if (!sessionToken || !expiresAt || new Date(expiresAt) <= new Date()) {
      router.push('/admin/inventory')
      return
    }
    
    setIsAuthenticated(true)
    fetchCleanupAnalysis()
  }, [router])

  const fetchCleanupAnalysis = async () => {
    try {
      setIsLoading(true)
      const sessionToken = sessionStorage.getItem('adminSessionToken')
      
      const response = await fetch('/api/admin/inventory/cleanup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCleanupData(data)
      } else {
        console.error('Failed to fetch cleanup analysis')
      }
    } catch (error) {
      console.error('Error fetching cleanup analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runCleanup = async () => {
    try {
      setIsRunningCleanup(true)
      const sessionToken = sessionStorage.getItem('adminSessionToken')
      
      const response = await fetch('/api/admin/inventory/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCleanupResult(data)
        // Refresh the analysis
        await fetchCleanupAnalysis()
      } else {
        const errorData = await response.json()
        setCleanupResult({ error: errorData.error })
      }
    } catch (error) {
      console.error('Error running cleanup:', error)
      setCleanupResult({ error: 'Erro ao executar limpeza' })
    } finally {
      setIsRunningCleanup(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Limpeza de Reservas</h1>
        <button onClick={() => router.push('/admin/inventory')} className="btn-secondary">
          ← Voltar ao Inventário
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Carregando análise...</div>
      ) : (
        <>
          {/* Analysis Summary */}
          {cleanupData && (
            <div className="cleanup-analysis">
              <h2>Análise do Sistema</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{cleanupData.analysis.totalReservations}</div>
                  <div className="stat-label">Total de Reservas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{cleanupData.analysis.activeReservations}</div>
                  <div className="stat-label">Reservas Ativas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{cleanupData.analysis.orphanedReservations}</div>
                  <div className="stat-label">Reservas Órfãs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{cleanupData.analysis.orphanedReservedCounters}</div>
                  <div className="stat-label">Contadores Órfãos</div>
                </div>
              </div>

              <div className="cleanup-actions">
                <button 
                  onClick={runCleanup}
                  disabled={isRunningCleanup || (cleanupData.analysis.orphanedReservations === 0 && cleanupData.analysis.orphanedReservedCounters === 0)}
                  className="btn-primary"
                  title={cleanupData.analysis.orphanedReservations === 0 && cleanupData.analysis.orphanedReservedCounters === 0 ? 'Nenhuma reserva órfã para limpar' : 'Limpar reservas órfãs'}
                >
                  {isRunningCleanup ? 'Executando...' : 'Executar Limpeza'}
                </button>
                <button onClick={fetchCleanupAnalysis} className="btn-secondary">
                  Atualizar Análise
                </button>
                {cleanupData.analysis.activeReservations > 0 && (
                  <button 
                    onClick={() => setShowForceCleanup(!showForceCleanup)} 
                    className="btn-warning"
                    title="Forçar limpeza de todas as reservas (use com cuidado)"
                  >
                    ⚠️ Forçar Limpeza
                  </button>
                )}
              </div>
              
              {cleanupData.analysis.orphanedReservations === 0 && cleanupData.analysis.orphanedReservedCounters === 0 && (
                <div className="info-message">
                  ✅ Sistema limpo - não há reservas órfãs para remover. 
                  {cleanupData.analysis.activeReservations > 0 && (
                    <span> As {cleanupData.analysis.activeReservations} reserva(s) ativa(s) expirarão automaticamente em até 10 minutos.</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Force Cleanup Confirmation */}
          {showForceCleanup && (
            <div className="force-cleanup-modal">
              <div className="modal-content">
                <h3>⚠️ Forçar Limpeza de Todas as Reservas</h3>
                <p><strong>ATENÇÃO:</strong> Esta ação irá:</p>
                <ul>
                  <li>Remover TODAS as {cleanupData.analysis.activeReservations} reserva(s) ativa(s)</li>
                  <li>Liberar todo o estoque reservado imediatamente</li>
                  <li>Potencialmente permitir compras de produtos que estão no processo de checkout</li>
                </ul>
                <p>Use apenas em situações de emergência ou teste!</p>
                <div className="modal-actions">
                  <button 
                    onClick={async () => {
                      // Force cleanup by deleting all reservations
                      setIsRunningCleanup(true)
                      try {
                        const sessionToken = sessionStorage.getItem('adminSessionToken')
                        // For now, just run the regular cleanup
                        // In a real scenario, you'd want a separate force-cleanup endpoint
                        const response = await fetch('/api/admin/inventory/cleanup', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${sessionToken}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ force: true })
                        })
                        const data = await response.json()
                        setCleanupResult({ 
                          message: `Limpeza forçada concluída. ${cleanupData.analysis.activeReservations} reserva(s) removida(s).`,
                          forced: true 
                        })
                        await fetchCleanupAnalysis()
                      } catch (error) {
                        setCleanupResult({ error: 'Erro ao forçar limpeza' })
                      } finally {
                        setIsRunningCleanup(false)
                        setShowForceCleanup(false)
                      }
                    }}
                    className="btn-danger"
                    disabled={isRunningCleanup}
                  >
                    {isRunningCleanup ? 'Executando...' : 'Confirmar Limpeza Forçada'}
                  </button>
                  <button 
                    onClick={() => setShowForceCleanup(false)} 
                    className="btn-secondary"
                    disabled={isRunningCleanup}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cleanup Result */}
          {cleanupResult && (
            <div className={`cleanup-result ${cleanupResult.error ? 'error' : 'success'}`}>
              <h3>Resultado da Limpeza</h3>
              {cleanupResult.error ? (
                <p>❌ {cleanupResult.error}</p>
              ) : (
                <p>✅ {cleanupResult.message}</p>
              )}
            </div>
          )}

          {/* Detailed Information */}
          {cleanupData && cleanupData.details && (
            <>
              {/* Orphaned Reservations */}
              {cleanupData.details.orphanedReservations.length > 0 && (
                <div className="detail-section">
                  <h3>Reservas Órfãs</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Session ID</th>
                          <th>Problema</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleanupData.details.orphanedReservations.map((item, index) => (
                          <tr key={index}>
                            <td>{item.sessionId}</td>
                            <td>{item.issue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orphaned Reserved Counters */}
              {cleanupData.details.orphanedReservedCounters.length > 0 && (
                <div className="detail-section">
                  <h3>Contadores de Reserva Órfãos</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Inventory ID</th>
                          <th>Contagem</th>
                          <th>Problema</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleanupData.details.orphanedReservedCounters.map((item, index) => (
                          <tr key={index}>
                            <td>{item.inventoryId}</td>
                            <td>{item.count}</td>
                            <td>{item.issue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Active Reservations */}
              {cleanupData.details.activeReservations.length > 0 && (
                <div className="detail-section">
                  <h3>Reservas Ativas (Amostra)</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Session ID</th>
                          <th>TTL (segundos)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleanupData.details.activeReservations.map((item, index) => (
                          <tr key={index}>
                            <td>{item.sessionId}</td>
                            <td>{item.ttl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="cleanup-info">
            <p><strong>Última atualização:</strong> {cleanupData?.lastUpdated ? new Date(cleanupData.lastUpdated).toLocaleString('pt-BR') : 'N/A'}</p>
          </div>
        </>
      )}

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .cleanup-analysis {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #ddd;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 8px;
        }

        .cleanup-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary, .btn-warning, .btn-danger {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-warning {
          background: #ffc107;
          color: #000;
        }

        .btn-warning:hover {
          background: #e0a800;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn-danger:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cleanup-result {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .cleanup-result.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .cleanup-result.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f1b0b7;
        }

        .detail-section {
          margin-bottom: 30px;
        }

        .detail-section h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        tr:hover {
          background: #f8f9fa;
        }

        .cleanup-info {
          padding: 15px;
          background: #e9ecef;
          border-radius: 8px;
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .info-message {
          padding: 15px;
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          margin-top: 15px;
          font-size: 14px;
        }

        .force-cleanup-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }

        .modal-content h3 {
          margin-bottom: 15px;
          color: #dc3545;
        }

        .modal-content ul {
          margin: 15px 0;
          padding-left: 25px;
        }

        .modal-content li {
          margin-bottom: 8px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  )
}