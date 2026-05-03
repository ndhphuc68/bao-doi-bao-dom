import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: 'postgresql://root:root@localhost:5432/appdb',
  });

  try {
    await client.connect();
    
    // Find a user
    const res = await client.query("SELECT id, email FROM users LIMIT 1");
    if (res.rows.length === 0) {
      console.log("No users found");
      return;
    }
    const user = res.rows[0];
    console.log(`Creating test notification for user: ${user.email} (${user.id})`);

    const insertQuery = `
      INSERT INTO notifications (id, "userId", title, message, type, "isRead", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, false, NOW())
    `;

    await client.query(insertQuery, [user.id, 'Chào mừng bạn!', 'Hệ thống thông báo đã sẵn sàng hoạt động.', 'SUCCESS']);
    await client.query(insertQuery, [user.id, 'Đơn hàng mới', 'Bạn có một đơn hàng vừa được xác nhận.', 'INFO']);

    console.log("Test notifications created successfully.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
