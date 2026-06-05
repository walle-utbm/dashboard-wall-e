from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import time, io
from fastapi.middleware.cors import CORSMiddleware
from random import *
from fastapi.staticfiles import StaticFiles
#from contextlib import asynccontextmanager
import asyncio, json


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


data = {
    "robot": "wall-e",
    "counter": 0,
    "speed": 0,
    "nb_objects_correct": 0,
    "nb_objects_incorrect": 0,
    "battery": 80,
    "temperature": 38.0,
    "proccesing_time": 0.0,
    "last_class": "null"
}

"""
@app.get("/data")
def get_data():
    data["counter"] += 1
    data["timestamp"] = time.time()
    speed = data["speed"]
    r = randint(1, 2)
    if r == 1:
        pass
    else:
        r = randint(1, 2)
        if r == 1 and speed > 0:
            data["speed"] = speed - 1
        elif r == 2 and speed < 20:
            data["speed"] = speed + 1
    if data["counter"] % 10 == 0:
        r = randint(1, 5)
        if r == 1:
            data["nb_objects_incorrect"] += 1
        else:
            data["nb_objects_correct"] += 1
    data["battery"] = max(0, data["battery"] - 0.04)
    data["temperature"] = data["temperature"] + randint(1, 3) - randint(1, 2)
    data["temperature"] = max(35.0, data["temperature"])
    data["temperature"] = min(45.0, data["temperature"])
    if data["counter"] % 20 == 0:
        data["processing_time"] = round(uniform(0.5, 3.5), 2)

    return data
"""

async def update_loop():
    while True:
        data["counter"] += 1
        data["timestamp"] = time.time()
        speed = data["speed"]
        r = randint(1, 2)
        if r == 1:
            pass
        else:
            r = randint(1, 2)
            if r == 1 and speed > 0:
                data["speed"] = speed - 1
            elif r == 2 and speed < 20:
                data["speed"] = speed + 1
        if data["counter"] % 10 == 0:
            r = randint(1, 5)
            if r == 1:
                data["nb_objects_incorrect"] += 1
            else:
                data["nb_objects_correct"] += 1
        data["battery"] = max(0, data["battery"] - 0.04)
        data["temperature"] = data["temperature"] + randint(1, 3) - randint(1, 2)
        data["temperature"] = max(35.0, data["temperature"])
        data["temperature"] = min(45.0, data["temperature"])
        if data["counter"] % 20 == 0:
            data["processing_time"] = round(uniform(0.5, 3.5), 2)
        await asyncio.sleep(0.5)

@app.get("/data")
def get_data():
    return data

"""
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(update_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)
"""

@app.on_event("startup")
async def startup():
    asyncio.create_task(update_loop())

@app.get("/stream")
async def stream():
    async def generator():
        while True:
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(0.5)
    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )

@app.get("/camera")
def get_camera():
    stream = io.BytesIO()
    with picamera.PiCamera() as cam:
        cam.capture(stream, format='jpeg')
    stream.seek(0)
    return StreamingResponse(stream, media_type="image/jpeg")

@app.post("/command")
async def receive_command(request: Request):
    body = await request.json()
    part = body.get("part")
    action = body.get("action")
    print(f"[CMD] {part} --> {action}")
    return {"status": "ok", "ack": f"{part}:{action} exécuté"}

@app.post("/validate")
async def receive_validation(request: Request):
    body = await request.json()
    correct = body.get("correct")
    print(f"[VALID] correct={correct}")
    if correct:
        data["nb_objects_correct"] += 1
    else:
        data["nb_objects_incorrect"] += 1
    return {"status": "ok", "message": "compteur mis à jour"}

app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/", StaticFiles(directory="walle-dashboard", html=True), name="dashboard")
