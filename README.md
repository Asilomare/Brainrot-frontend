# Brainrot Video Montage App

A Next.js application for creating video montages from uploaded videos and music.

## Features

- Upload videos to custom folders
- Upload music to custom folders
- Create montages by selecting video and music folders
- View and download completed montages

## Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Cloud Storage**: AWS S3 (for storing videos and music)
- **Asynchronous Processing**: Backend service for montage creation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS account with S3 buckets set up
- AWS credentials with access to S3

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd brainrot/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your AWS credentials:
   ```
   NEXT_PUBLIC_AWS_REGION=your_aws_region
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_id
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_access_key
   NEXT_PUBLIC_VIDEO_BUCKET_NAME=your_video_bucket_name
   NEXT_PUBLIC_MUSIC_BUCKET_NAME=your_music_bucket_name
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Uploading Videos
1. Navigate to "Upload Video"
2. Create a new folder by providing a folder name
3. Upload video files (MP4, MOV, or WebM)

### Uploading Music
1. Navigate to "Upload Music"
2. Create a new folder by providing a folder name
3. Upload audio files (MP3, WAV, or OGG)

### Creating Montages
1. Navigate to "Create Montage"
2. Select a video folder
3. Select a music folder
4. Click "Create Montage"

### Viewing Montages
1. Navigate to "My Montages"
2. View pending montage requests and completed montages
3. Download completed montages

## Development

### Project Structure

- `src/app/`: Contains page components
- `src/components/`: Reusable UI components
- `src/lib/`: Utility functions and types

### Adding New Features

- Create new components in `src/components/`
- Add new pages in `src/app/`
- Add utility functions in `src/lib/`

## Deployment

For production deployment:

```
npm run build
npm run start
```

## Backend Integration

This frontend application connects to a backend service for processing montages. The backend should provide:

1. S3 bucket access for uploaded files
2. Video processing capabilities
3. Montage creation and storage

## License

[MIT](LICENSE)
