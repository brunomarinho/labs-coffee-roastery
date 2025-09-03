export default function ExternalLink({ href, children, className }) {
  // Check if link is external
  const isExternal = href && (
    href.startsWith('http://') || 
    href.startsWith('https://') || 
    href.startsWith('//') ||
    href.startsWith('www.')
  );

  if (isExternal) {
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  // For internal links, return regular anchor
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}