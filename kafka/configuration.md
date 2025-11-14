# Kafka Configuration for Social Platform

## Topics

### chat_messages
- **Purpose**: Store all chat messages for archiving, analytics, and replay
- **Key**: chatId
- **Value**: JSON with message details
- **Replication Factor**: 3
- **Partitions**: 16

### call_events
- **Purpose**: Store video call events (start, end, participant changes)
- **Key**: callId
- **Value**: JSON with call event details
- **Replication Factor**: 3
- **Partitions**: 8

### notifications
- **Purpose**: Store notification events for processing
- **Key**: userId
- **Value**: JSON with notification details
- **Replication Factor**: 3
- **Partitions**: 8

### user_events
- **Purpose**: Store user-related events (profile updates, status changes)
- **Key**: userId
- **Value**: JSON with user event details
- **Replication Factor**: 3
- **Partitions**: 8

### friend_events
- **Purpose**: Store friend request and friendship events
- **Key**: userId (the user affected by the event)
- **Value**: JSON with friend event details
- **Replication Factor**: 3
- **Partitions**: 8

## Consumer Groups

### chat-archiver
- **Topics**: chat_messages
- **Purpose**: Archive chat messages to long-term storage

### notification-processor
- **Topics**: notifications
- **Purpose**: Process and send notifications via various channels

### analytics-pipeline
- **Topics**: chat_messages, call_events, user_events, friend_events
- **Purpose**: Collect analytics data for business intelligence

### search-indexer
- **Topics**: user_events
- **Purpose**: Update search indexes when user profiles change

## Kafka Connectors
- MongoDB Sink Connector for archiving messages
- Elasticsearch Sink Connector for search indexing
- Email/SMS Sink Connector for notifications

## Security
- SSL encryption for data in transit
- SASL/SCRAM authentication
- Topic-level ACLs for access control