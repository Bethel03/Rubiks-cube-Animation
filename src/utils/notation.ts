// Valid base moves
const VALID_MOVES = ['U', 'D', 'R', 'L', 'F', 'B'];

export const parseNotation = (sequence: string): string[] => {
  if (!sequence) return [];

  // Remove all whitespace and make uppercase
  const cleanSeq = sequence.toUpperCase().replace(/\s+/g, '');
  const moves: string[] = [];

  let i = 0;
  while (i < cleanSeq.length) {
    const char = cleanSeq[i];
    if (VALID_MOVES.includes(char)) {
      let move = char;
      // Check for modifier (' or 2)
      if (i + 1 < cleanSeq.length && (cleanSeq[i + 1] === "'" || cleanSeq[i + 1] === '2')) {
        move += cleanSeq[i + 1];
        i++;
      }
      moves.push(move);
    }
    i++;
  }

  return moves;
};
