import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import InstagramEmbed from '../../../components/InstagramEmbed';
import { processExternalLinks } from '../../../utils/processMarkdownLinks';
import { processInstagramEmbeds } from '../../../utils/processInstagramEmbeds';
import { generateBlogMetadata as generateSeoBlogMetadata, JsonLd, generateArticleSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo';

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
    
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(content);
    
    // Process external links to open in new tab
    const contentWithExternalLinks = processExternalLinks(processedContent.toString());

    // Convert Instagram URLs to embeds
    const contentWithInstagram = processInstagramEmbeds(contentWithExternalLinks);

    return {
      slug,
      title: data.title || 'Sem título',
      date: data.date || '',
      description: data.description || firstParagraph,
      content: contentWithInstagram,
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

  if (!post) {
    return {
      title: 'Artigo não encontrado | Mameluca',
    };
  }

  return generateSeoBlogMetadata({
    ...post,
    excerpt: post.description
  });
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

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title }
  ]);

  const articleSchema = generateArticleSchema(post);
  const structuredData = combineSchemas([breadcrumbSchema, articleSchema]);

  return (
    <>
      <JsonLd data={structuredData} id="article-structured-data" />
      <InstagramEmbed />
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