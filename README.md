# Newsify Prototype

Newsify is a school-centric news platform that redefines how we consume news. It is not just another news app. It encourages users to share their insights and have meaningful discussions with others, which increases the student's engagement in the school!

# Project overview

1. Client (Mobile): React Native
2. Server: FastAPI (Python)
3. Database: Supabase

# Setting up

Clone this into your selected working directory. For example, "C:\Users\john\Projects".

In your working directory, type this in the command line:

```
git clone https://github.com/vinang0701/newsify-poc.git
```

## Client

### Requirements

Nodejs, JDK (Java SE Development Kit), Android Studio (for testing)/Expo Go (install on your mobile)
Guide: https://reactnative.dev/docs/set-up-your-environment

### Installation

After you have set up your environment, you may proceed with this part.

Assuming you are in the "newsify-poc" directory, navigate to client/ directory. Eg, "C:\Users\john\Projects\newsify-poc\client".

```
cd client
```

Install the neccessary dependencies:

```
npm install
```

### Starting up

In the client/ directory, paste this in the command line:

```
npx expo start
```

You can either use Android Studio on your desktop, or Expo Go on your mobile to test the program.

**Android Studio**

1. Ensure you have Android Studio running in the background.
2. If the client server is already running, you can press the "a" key in the command line to start.
3. If not, you could use:

```
npx expo start --android
```

**Expo Go**

1. Once the client server is running, scan the QR code on the EXPO Go app.

## Server

### Requirements

Python3.10^

Guide: https://fastapi.tiangolo.com/

### Installation

After you have set up your environment, you may proceed with this part.

Assuming you are in the "newsify-poc" directory, navigate to server/ directory. Eg, "C:\Users\john\Projects\newsify-poc\server".

```
cd server
```

Create a virtual environment:

```
python -m venv venv
```

This step will take a while. When it is done running, you should see a new directory called venv.

Activate the venv in cmd:

```
.\venv\Scripts\activate
```

You should see (venv) beside your directory in the command line.

**Installing dependencies**

```
pip install -r requirements.txt
```

### Starting up

In the server/ directory, paste this in the command line:

```
fastapi dev main.py
```
