import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

async function getPostData(slug) {
  const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    if (data.visibility === false) {
      return null;
    }
    
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(content);
    
    return {
      slug,
      title: data.title || 'Sem título',
      date: data.date || '',
      content: processedContent.toString(),
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export async function generateStaticParams() {
  const blogDirectory = path.join(process.cwd(), 'content', 'blog');
  
  try {
    const files = fs.readdirSync(blogDirectory);
    
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        slug: file.replace('.md', ''),
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostData(slug);
  
  if (!post) {
    return {
      title: 'Artigo não encontrado | Labs Coffee Roastery',
    };
  }
  
  return {
    title: `${post.title} | Labs Coffee Roastery`,
    description: `Leia sobre ${post.title} em nosso blog sobre café especial`,
  };
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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostData(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <>
      <Header />
      <main className="container">
        <article className="blog-post">
          <header className="blog-post-header">
            <Link href="/blog" className="back-link">
              ← Voltar ao blog
            </Link>
            <h1>{post.title}</h1>
            <time className="blog-post-date" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </header>
        
        <div 
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
          <footer className="blog-post-footer">
            <Link href="/blog" className="button button-secondary">
              Ver mais artigos
            </Link>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}