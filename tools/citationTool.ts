interface Source {
  url: string;
  title?: string;
  author?: string;
  date?: string;
}

export type CitationStyle = 'APA' | 'MLA' | 'CHICAGO';

export const formatCitation = (source: Source, style: CitationStyle = 'APA'): string => {
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

export const formatBibliography = (urls: string[], style: CitationStyle): string => {
  // In a real app, we would scrape metadata. For now, we simulate title extraction from URL.
  const sources: Source[] = urls.map(url => {
    let title = 'UNKNOWN SOURCE';
    try {
      title = new URL(url).hostname.replace('www.', '').toUpperCase();
    } catch (e) {
      title = 'SOURCE';
    }
    
    return {
      url,
      title,
      date: new Date().toISOString()
    };
  });

  return sources.map(s => formatCitation(s, style)).join('\n\n');
};