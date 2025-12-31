import { formatBibliography, CitationStyle } from "../tools/citationTool";

export const generateBibliography = (urls: string[], style: CitationStyle = 'APA'): string => {
    // In a full agent, this would validate URLs and fetch metadata
    return formatBibliography(urls, style);
};