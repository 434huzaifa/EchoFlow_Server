# EchoFlow Server

A MERN stack comment system with real-time updates using Socket.IO and JWT authentication.

## Features

- User authentication with JWT tokens
- Create, update, and delete comments
- Reply to comments (one level deep)
- Like/dislike posts and comments
- Real-time updates via WebSockets
- Pagination support
- One comment per user per post
- Optimized with MongoDB indexes

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Zod

## Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/434huzaifa/EchoFlow_Server
cd EchoFlow_Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/echoflow
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT you specified).

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `POST /api/users/refresh` - Refresh access token

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/like` - Like/unlike post (auth required)
- `POST /api/posts/:id/dislike` - Dislike/undislike post (auth required)

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)
- `POST /api/comments/:id/like` - Like/unlike comment (auth required)
- `POST /api/comments/:id/dislike` - Dislike/undislike comment (auth required)

### Replies
- `POST /api/comments/:commentId/replies` - Create reply (auth required)
- `PUT /api/comments/replies/:replyId` - Update reply (auth required)
- `DELETE /api/comments/replies/:replyId` - Delete reply (auth required)
- `POST /api/comments/replies/:replyId/like` - Like/unlike reply (auth required)
- `POST /api/comments/replies/:replyId/dislike` - Dislike/undislike reply (auth required)

## WebSocket Events

### Client → Server
- `FETCH_POSTS_REQUEST` - Fetch posts with pagination
- `FETCH_COMMENTS_REQUEST` - Fetch comments for a post
- `FETCH_COMMENT_REPLIES_REQUEST` - Fetch replies for a comment

### Server → Client (Broadcasts)
- `NEW_POST_BROADCAST` - New post created
- `POST_UPDATE_BROADCAST` - Post updated
- `POST_DELETE_BROADCAST` - Post deleted
- `NEW_COMMENT_BROADCAST` - New comment created
- `COMMENT_UPDATE_BROADCAST` - Comment updated
- `COMMENT_DELETE_BROADCAST` - Comment deleted
- `NEW_REPLY_BROADCAST` - New reply created
- `REPLY_UPDATE_BROADCAST` - Reply updated
- `REPLY_DELETE_BROADCAST` - Reply deleted
- `COMMENT_LIKE_BROADCAST` - Comment liked/unliked
- `COMMENT_DISLIKE_BROADCAST` - Comment disliked/undisliked
- `REFETCH_POSTS` - Trigger posts refetch

## Project Structure

```
EchoFlow_Server/
├── common/          # Shared utilities and helpers
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic layer
├── socket/          # WebSocket handlers
├── server.js        # Entry point
└── package.json     # Dependencies
```

[Frontend Server](https://github.com/434huzaifa/EchoFlow)
