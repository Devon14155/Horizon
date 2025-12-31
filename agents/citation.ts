import { Source } from '../types';
import { formatBibliography, CitationStyle } from "../tools/citationTool";

export const generateBibliography = (sources: Source[], style: CitationStyle = 'APA'): string => {
    return formatBibliography(sources, style);
};