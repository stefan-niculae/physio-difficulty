# physio-difficulty
Adaptive game difficulty through non-intrusive heart-rate and facial expression measurements


## Deployment using Docker
### Build the Docker image 
```
cd Docker
docker build -t physio-difficulty:latest .
```
### Run the container
Run the Docker image using 
```
docker run -p 9997:80 -d -t physio-difficulty:latest
```
The application should then be running on port 9997 which you can access by visiting 
```
http://localhost:9997/
```
__Note: Webcam function through http only works on Firefox__
