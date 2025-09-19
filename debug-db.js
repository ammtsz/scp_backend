// Quick database diagnostic script
const { execSync } = require('child_process');

console.log('🔍 Database Diagnostic Script');
console.log('=====================================');

try {
  // Check treatment_sessions table
  console.log('\n📋 Treatment Sessions:');
  const treatmentSessions = execSync('psql -h localhost -p 5432 -U docker -d scp_database -t -c "SELECT id, patient_id, treatment_type, body_location, planned_sessions, created_at FROM treatment_sessions ORDER BY created_at DESC LIMIT 5;"', { encoding: 'utf8' });
  console.log(treatmentSessions);

  // Check treatment_session_records table
  console.log('\n📋 Treatment Session Records:');
  const sessionRecords = execSync('psql -h localhost -p 5432 -U docker -d scp_database -t -c "SELECT id, treatment_session_id, session_number, scheduled_date, status, created_at FROM treatment_session_records ORDER BY created_at DESC LIMIT 10;"', { encoding: 'utf8' });
  console.log(sessionRecords);

  // Check if the tables exist and their structure
  console.log('\n🏗️ Table Structure Check:');
  const tableExists = execSync('psql -h localhost -p 5432 -U docker -d scp_database -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_name IN (\'treatment_sessions\', \'treatment_session_records\');"', { encoding: 'utf8' });
  console.log('Tables found:', tableExists);

  // Check foreign key constraints
  console.log('\n🔗 Foreign Key Constraints:');
  const constraints = execSync('psql -h localhost -p 5432 -U docker -d scp_database -t -c "SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name FROM information_schema.key_column_usage k JOIN information_schema.referential_constraints r ON k.constraint_name = r.constraint_name WHERE k.table_name = \'treatment_session_records\';"', { encoding: 'utf8' });
  console.log(constraints);

} catch (error) {
  console.error('❌ Error connecting to database:', error.message);
  console.log('\nPossible solutions:');
  console.log('1. Make sure PostgreSQL is running: brew services start postgresql');
  console.log('2. Check if Docker container is running: docker ps');
  console.log('3. Verify database credentials in .env file');
}
