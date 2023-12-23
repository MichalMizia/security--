This is a [Next.js](https://nextjs.org/) app, initially built as a school project, but later turned into a fun experiment with face authorization. It uses [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) for AI models used to detect and compare faces.


https://github.com/MichalMizia/security--/assets/111043070/1338bb0a-7e67-4d1f-995e-23d613d15804


## Getting Started

To get the app working locally, replace variables in .env.example with Your real keys and change the name to .env.local

To get the nodemailer password, follow this [tutorial](https://medium.com/@y.mehnati_49486/how-to-send-an-email-from-your-gmail-account-with-nodemailer-837bf09a7628)

Install dependencies:

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How it works?

The main goal of this project was to create a document management system connected via Wi-Fi to a physical esp32 controller and a cabinet with automatic locks. This app is the software part of the whole build.

Once a user signs up via username and email, they can access a document table built using @tanstack/react-table.

When adding a new document, a user is prompted to select a **category** and add the physical paper document to the **corresponding cabinet**. Then when the user wants to take out a document, he can search for it by description, title created date etc.

## Accessing documents

After clicking 'access document' there are two options.

1. The user has not yet input a face image into the system, in this case, the API will return the PIN code which will also be sent to esp32 for verification. Then the user should input the pin on the screen next to the cabinet.

2. The user has added a face image. He will be asked to verify it by scanning his face and sending it to the API, if the API detects it is the same face as in the file the user has added previously, he will be granted access via the PIN code.

## Changing the face image.

To change the face image, I implemented a flow similar to password reset, where a user gets an email that points to a path /upload-face/[token]/[userId]

If the JWT is valid, the user can reupload a new face image and overwrite the previous one.

## Authorizing.

To authorize, a user needs to send a face scan to the API, this process is resource intensive on the browser because I utilized it to draw the face detection on the video streamed from the client, so the browser needs to download ~400kb of AI models.

If you successfully authorize your face, the JWT token will hold a value called isFaceAuthorized set to true for 1 hour. All validation is performed on the server.

To reset the isFaceAuthorized after 1 hour I used a clever trick outlined in the auth.ts file

## Important components

The most important component for face authorization is FaceScanner.tsx, it streams the video from the user's camera and every 400ms repaints the detected face onto the video.

When the submit button of this component is clicked. The current frame on the canvas gets turned into a file and passed onto the onSubmit function.

The onSubmit, which decides what to do with the file, is passed from the parent to FaceScanner.tsx
