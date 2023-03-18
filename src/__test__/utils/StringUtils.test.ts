import {
  formatForDbEntry,
  formatForDbSearchColumn,
  isNumeric,
  removeDoubleSpaces,
  removePunctuation,
} from '../../utils/StringUtils';

test('IsNumeric function works', () => {
  expect(isNumeric('123')).toBe(true);
  expect(isNumeric('abc')).toBe(false);
  expect(isNumeric('123abc')).toBe(false);
  expect(isNumeric('0')).toBe(true);
  expect(isNumeric('')).toBe(false);
});

test('Remove punctuation function works', () => {
  expect(
    removePunctuation("string's with#%@ specia!@l chara,cters[]-=...")
  ).toBe('strings with special characters');
});

test('Remove double spaces function works', () => {
  expect(
    removeDoubleSpaces('this line    has      double           spaces')
  ).toBe('this line has double spaces');
});

test('FormatForDbEntry function works', () => {
  expect(formatForDbEntry('Stay the same')).toBe('Stay the same');
  expect(formatForDbEntry("With 'Quotes'")).toBe("With ''Quotes''");
});

test('FormatForDbSearchColumn function works', () => {
  expect(
    formatForDbSearchColumn('@#FORmat[] for    search column..%%$()#{}"')
  ).toBe('format for search column');
});
