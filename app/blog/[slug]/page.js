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
import { processExternalLinks } from '../../../utils/processMarkdownLinks';

async function getPostData(slug) {
  const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    if (data.visibility === false) {
      return null;
    }
    
    // Extract first paragraph for description
    const firstParagraph = content.split('\n\n')[0]
      .replace(/[#*_\[\]]/g, '')
      .trim()
      .substring(0, 160);
    
    const processedContent = await remark()
      .use(gfm)
      .use(html)
      .process(content);
    
    // Process external links to open in new tab
    const contentWithExternalLinks = processExternalLinks(processedContent.toString());
    
    return {
      slug,
      title: data.title || 'Sem título',
      date: data.date || '',
      description: data.description || firstParagraph,
      content: contentWithExternalLinks,
      image: data.image,
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br';
  
  if (!post) {
    return {
      title: 'Artigo não encontrado | Mameluca',
    };
  }
  
  return {
    title: `${post.title} | Mameluca`,
    description: post.description,
    keywords: `${post.title}, café especial, blog café, mameluca blog`,
    openGraph: {
      title: `${post.title} | Mameluca`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: post.image ? [{
        url: post.image,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Mameluca`,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
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
            
            <h1>{post.title}</h1>
            <time className="blog-post-date" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </header>
        
        <div 
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        

        </article>
      </main>
      <Footer />
    </>
  );
}