import {formatForDbEntry, isNumeric} from '../../utils/StringUtils';

test('IsNumeric function works', () => {
  expect(isNumeric('123')).toBe(true);
  expect(isNumeric('abc')).toBe(false);
  expect(isNumeric('123abc')).toBe(false);
  expect(isNumeric('0')).toBe(true);
  expect(isNumeric('')).toBe(false);
});

test('FormatForDbEntry function works', () => {
  expect(formatForDbEntry('Stay the same')).toBe('Stay the same');
  expect(formatForDbEntry("With 'Quotes'")).toBe("With ''Quotes''");
});
