export function parseNumber(input: any): number {
  const matches = input.match(/\d+/g);
 return matches ? matches.map(Number)[0] : NaN;
}
