// Quick test to verify Tuesday calculation
function getNextTuesday(date) {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 2 = Tuesday
  
  if (dayOfWeek === 2) {
    // It's already Tuesday
    return result;
  }
  
  // Calculate days until next Tuesday (FIXED PROPERLY)
  let daysToAdd;
  if (dayOfWeek < 2) {
    // Sunday (0) or Monday (1) -> add days to reach Tuesday
    daysToAdd = 2 - dayOfWeek;
  } else {
    // Wednesday (3), Thursday (4), Friday (5), Saturday (6) -> add days to reach next Tuesday
    daysToAdd = 7 - dayOfWeek + 2;
  }
  
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

// Test the dates from our test
console.log('Monday Jan 15, 2024 -> Next Tuesday:', getNextTuesday(new Date('2024-01-15')).toISOString().split('T')[0]);
console.log('Tuesday Jan 16, 2024 -> Same Tuesday:', getNextTuesday(new Date('2024-01-16')).toISOString().split('T')[0]);
console.log('Wednesday Jan 17, 2024 -> Next Tuesday:', getNextTuesday(new Date('2024-01-17')).toISOString().split('T')[0]);
console.log('Sunday Jan 21, 2024 -> Next Tuesday:', getNextTuesday(new Date('2024-01-21')).toISOString().split('T')[0]);
