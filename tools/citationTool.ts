import { Source } from '../types';

export type CitationStyle = 'APA' | 'MLA' | 'CHICAGO';

export const formatCitation = (source: {url: string, title?: string, author?: string, date?: string}, style: CitationStyle = 'APA'): string => {
  const date = source.date ? new Date(source.date) : new Date();
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const title = source.title || 'No Title';
  const url = source.url;
  const author = source.author || 'Anonymous';

  switch (style) {
    case 'APA':
      // Author, A. A. (Year, Month Day). Title of work. Site Name. URL
      return `${author}. (${year}, ${month} ${day}). ${title}. Retrieved from ${url}`;
    
    case 'MLA':
      // Author. "Title of Source." Title of Container, Publisher, Publication Date, Location.
      return `${author}. "${title}." Web. ${day} ${month} ${year}. <${url}>.`;
    
    case 'CHICAGO':
      // Author. "Title." Access Date. URL.
      return `${author}. "${title}." Accessed ${month} ${day}, ${year}. ${url}.`;
      
    default:
      return source.url;
  }
};

export const formatBibliography = (sources: Source[], style: CitationStyle): string => {
  return sources.map(s => formatCitation({
      url: s.url,
      title: s.title,
      date: new Date().toISOString() // Fallback to current date as access date
  }, style)).join('\n\n');
};