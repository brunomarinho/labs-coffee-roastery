import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Blog | Labs Coffee Roastery',
  description: 'Artigos sobre café, torra, métodos de preparo e muito mais',
};

async function getBlogPosts() {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog');
  
  try {
    const files = fs.readdirSync(blogDirectory);
    
    const posts = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(blogDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);
        
        return {
          slug: file.replace('.md', ''),
          title: data.title || 'Sem título',
          date: data.date || '',
          visibility: data.visibility !== false,
        };
      })
      .filter(post => post.visibility)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  };
  return date.toLocaleDateString('pt-BR', options);
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <Header />
      <main className="container">
        <h1>Blog. Opiniões sobre café.</h1>

        <div className="blog-grid">
          {posts.length > 0 ? (
            posts.map(post => (
              <article key={post.slug} className="blog-card">
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-content">
                    <h2 className="blog-card-title">{post.title}</h2>
                    <time className="blog-card-date" dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                  </div>
                  
                </Link>
              </article>
            ))
          ) : (
            <p className="no-posts">Nenhum artigo disponível no momento.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}