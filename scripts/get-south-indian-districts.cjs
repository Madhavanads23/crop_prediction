const mysql = require('mysql2/promise');

async function getSouthIndianDistricts() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'agrismart_user', 
      password: 'agrismart_mysql_2025',
      database: 'agrismart_db'
    });
    
    const [districts] = await connection.execute(`
      SELECT DISTINCT state_name, district_name, COUNT(*) as records
      FROM historical_crop_data 
      WHERE state_name IN ('Tamil Nadu', 'Karnataka', 'Andhra Pradesh')
      GROUP BY state_name, district_name
      ORDER BY state_name, records DESC
    `);
    
    console.log('🏘️  Districts in South Indian States:\n');
    let currentState = '';
    const stateDistricts = {};
    
    districts.forEach(row => {
      if (!stateDistricts[row.state_name]) {
        stateDistricts[row.state_name] = [];
      }
      stateDistricts[row.state_name].push(row.district_name);
      
      if (row.state_name !== currentState) {
        console.log(`📍 ${row.state_name}:`);
        currentState = row.state_name;
      }
      console.log(`  • ${row.district_name}: ${row.records} records`);
    });
    
    console.log('\n🔧 For Form Implementation:');
    Object.keys(stateDistricts).forEach(state => {
      console.log(`\n${state} districts: ${stateDistricts[state].length} options`);
      stateDistricts[state].slice(0, 5).forEach(district => {
        console.log(`  <SelectItem value="${district}">${district}</SelectItem>`);
      });
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getSouthIndianDistricts();