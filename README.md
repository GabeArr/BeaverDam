# BeaverDam
Video annotation tool for deep learning training labels

## Installation

Make sure `virutalenv` is installed on your computer. Search for OS specific instructions.

Clone the repository

```
cd BeaverDam
virtualenv -p python3 venv
. venv/bin/activate
pip3 install -r requirements.txt
```

### (Optional) Downloading Sample Data

Download `https://s3-us-west-2.amazonaws.com/beaverdam/test_vid.zip` and extract into
`BeaverDam/static/videos/test_vid`

## Running the Server

`./run_server.sh`
Then navigate to `localhost:5000/video/test_vid` in your browser.
