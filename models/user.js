/** User class for message.ly */
const db = require('../db')
const ExpressError = require("../expressError");
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashedPw = bcrypt.hash(password, BCRYPT_WORK_FACTOR) 
    const results = await db.query(`
    INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
    VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
    RETURNING username, password, first_name, last_name, phone
    `, [username, hashedPw, first_name, last_name, phone])
    const user = results.rows[0]
    return user
  }
 
  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const check_user = await db.query(`SELECT username, password FROM users WHERE username = $1`, [username])
    const user = check_user.rows[0]
    const checkedPw = await bcrypt.compare(password, check_user.rows[0].password);
    if(!check_user || !checkedPw){
      throw new ExpressError('Not valid credentials', 400)
    }
    return user
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const results = await db.query(`
    UPDATE users
    SET last_login_at = current_timestamp
    WHERE username = $1
    `, [username])
    return results.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`
    SELECT username, first_name, last_name, phone
    FROM users
    `)
    return results.rows
   }
  
  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(`
    SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username = $1
    `, [username])
    return results.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */


  static async messagesFrom(username) { 
    const message = await db.query(`
    SELECT m.id, m.to_username, m.body, u2.username, u2.first_name, u2.last_name, u2.phone, m.sent_at, m.read_at
    FROM users AS u
    LEFT JOIN messages AS m ON u.username = m.from_username
    LEFT JOIN users AS u2 ON m.to_username = u2.username
    WHERE u.username = $1
    `, [username])

    return message.rows.map(msg =>{
      return {
        body: msg.body,
        id: msg.id,
        read_at: msg.read_at,
        sent_at: msg.sent_at,
        to_user:{
          first_name:msg.first_name,
          last_name: msg.last_name,
          phone: msg.phone,
          username:msg.username
        }

      }
    })
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */
  static async messagesTo(username) { 
    const results = await db.query(`
    SELECT toUser.username, toUser.first_name, toUser.last_name, toUser.phone,m.id, m.body, m.read_at, m.sent_at, m.from_username, fromUser.first_name,
    fromUser.last_name, fromUser.phone, fromUser.username
    FROM users AS toUser
    LEFT JOIN messages AS m ON toUser.username = m.to_username
    LEFT JOIN users AS fromUser ON m.from_username = fromUser.username
    WHERE toUser.username = $1
    `, [username])
    return results.rows.map(res =>{
      return {
        body: res.body,
        from_user:{
          first_name:res.first_name,
          last_name: res.last_name,
          phone: res.phone,
          username: res.username
        },
        id: res.id,
        read_at:res.read_at,
        sent_at: res.sent_at,
      }
    })
  }
  

  
}


module.exports = User;