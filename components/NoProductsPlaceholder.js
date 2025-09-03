import ExternalLink from './ExternalLink'

export default function NoProductsPlaceholder() {
  return (
    <p className="no-products-placeholder">
      Nosso primeiro café será lançado em breve.<br /> Siga <ExternalLink href="https://www.instagram.com/mamelucacafe">@mamelucacafe</ExternalLink> para ficar por dentro das novidades.
    </p>
  )
}