function correctValueToGrid(value) {
    return value - (value % SEGMENTSIZE)
}


let genRandom;

let food;

let SEGMENTSIZE = 35;

let canvasWidth = correctValueToGrid(window.innerWidth);
let canvasHeight = correctValueToGrid(window.innerHeight);


function setup() {
    createCanvas(correctValueToGrid(window.innerWidth), correctValueToGrid(window.innerHeight));
    background(33);
    genRandom = function (lowerLimit, upperLimit) {
        return random(lowerLimit, upperLimit);
    }
    food = new Food();
}

let started = false;
let paused = false;
let lost = false;



let showLeadingSegment = false;



class Segment {
    constructor(x, y, lead = false, newNode = false) {
        this.x = x;
        this.y = y;
        this.lead = lead; //if this is the lead direction segment
        this.newNode = newNode; //dont move it if new
        this.size = SEGMENTSIZE;
    }
}

class Food {
    constructor() {
        let genX = genRandom(15, canvasWidth - SEGMENTSIZE);
        this.x = genX - (genX % SEGMENTSIZE)
        let genY = genRandom(15, canvasHeight - SEGMENTSIZE);
        this.y = genY - (genY % SEGMENTSIZE)

        this.size = SEGMENTSIZE;
        this.draw = () => {
            fill(0, 255, 100);
            rect(this.x, this.y, this.size, this.size)
        }

        this.move = () => {
            genX = genRandom(15, canvasWidth - SEGMENTSIZE);
            this.x = genX - (genX % SEGMENTSIZE)
            genY = genRandom(15, canvasHeight - SEGMENTSIZE);
            this.y = genY - (genY % SEGMENTSIZE);
        }
    }
}

class Snake {
    constructor() {
        this.segments = [new Segment(correctValueToGrid(canvasWidth / 2) - SEGMENTSIZE, correctValueToGrid(canvasHeight / 2), true), new Segment(correctValueToGrid(canvasWidth / 2), correctValueToGrid(canvasHeight / 2))];
        this.length = this.segments.length - 1;
        this.direction = "left";
        this.lastDirection = "left";
        this.move = () => {
            //move head in direction of travel
            if (this.direction === "left") {
                this.segments[0].x -= SEGMENTSIZE;
            } else if (this.direction === "right") {
                this.segments[0].x += SEGMENTSIZE;
            } else if (this.direction === "up") {
                this.segments[0].y -= SEGMENTSIZE;
            } else if (this.direction === "down") {
                this.segments[0].y += SEGMENTSIZE;
            }

            this.lastDirection = this.direction;
            //check head off screen
            if (this.segments[0].x > canvasWidth || this.segments[0].x < 0 || this.segments[0].y < 0 || this.segments[0].y > canvasHeight) {
                lost = true;
            }


            let potentialCollisions = [];

            for (let i = 2; i < this.segments.length; i++) { //skip lead segment and head
                let segment = this.segments[i];
                if (!segment.lead) {
                    if (segment.y === this.segments[0].y) {
                        potentialCollisions.push(segment)
                    }
                }
            }

            for (let segment of potentialCollisions) {
                if (!segment.lead) {
                    if (segment.x === this.segments[0].x) {

                        fill(0, 255, 255);
                        rect(segment.x, segment.y, segment.size, segment.size)

                        lost = true;
                    }
                }
            }

            //shift all segments

            for (let i = this.segments.length - 1; i > 0; i--) {

                if (!this.segments[i].newNode) {
                    this.segments[i].x = this.segments[i - 1].x;
                    this.segments[i].y = this.segments[i - 1].y;
                    if (correctValueToGrid(this.segments[i].x) === correctValueToGrid(food.x) && correctValueToGrid(this.segments[i].y) === correctValueToGrid(food.y)) {
                        this.grow();
                        food.move();
                    } else {
                        console.log(`Snake x ${this.segments[i].x} !== ${food.x} and Snake y ${this.segments[i].y} !== ${food.y}`)
                    }
                } else {
                    this.segments[i].newNode = false;
                }


            }
        }


        this.draw = () => {
            for (let i = this.segments.length - 1; i >= 0; i--) {
                let segment = this.segments[i];
                if (!segment.lead) {
                    fill(255, 0, 0)
                    rect(segment.x, segment.y, segment.size, segment.size)
                } else if (showLeadingSegment) {
                    fill(0, 255, 255);
                    rect(segment.x, segment.y, segment.size, segment.size)
                }
            }
        }

        this.grow = () => {
            console.log("snake grew")
            this.segments.push(new Segment(this.segments[this.length].x, this.segments[this.length].y, false, true))
            this.length = this.segments.length - 1;
            console.log(this.segments)
        }

    }
}

let snake = new Snake();



function draw() {
    frameRate(300 / SEGMENTSIZE)
    // frameRate(2)

    if (started && !paused) {

        background(33);
        food.draw();
        snake.move();
        snake.draw();
        if (lost) {
            paused = true;
            fill(255, 0, 0);
            textSize(32);
            textAlign(CENTER)
            text("YOU DIED", canvasWidth / 2, canvasHeight / 3)
        }
    } else if (!started) {
        fill(255);
        textSize(32);
        textAlign(CENTER)
        text("Press Any Key To Start", canvasWidth / 2, canvasHeight / 3)

    }


}


function keyPressed() {


    if (lost) {
        window.location.reload();
    }
    started = true;
    if (keyCode === LEFT_ARROW && (snake.lastDirection !== "right" || snake.length === 1)) {
        snake.direction = "left"
    } else if (keyCode === RIGHT_ARROW && (snake.lastDirection !== "left" || snake.length === 1)) {
        snake.direction = "right"
    } else if (keyCode === UP_ARROW && (snake.lastDirection !== "down" || snake.length === 1)) {
        snake.direction = "up"
    } else if (keyCode === DOWN_ARROW && (snake.lastDirection !== "up" || snake.length === 1)) {
        snake.direction = "down"
    } else if (keyCode === ESCAPE) {
        console.log(paused)
        paused = !paused;
    }
}

let lastTouch;
let touchLocked

document.addEventListener("touchstart", function (e) {
    
    if (lost) {
        window.location.reload();
    }
    started = true;
});


document.addEventListener("touchmove", function (e) {
    console.log(e)
    let touch = e.touches[0];
    if (lastTouch !== undefined) {
        let xMove = touch.pageX - lastTouch.pageX;
        let yMove = touch.pageY - lastTouch.pageY;
        console.log(`${xMove}, ${yMove}`)

        if (Math.abs(xMove) > Math.abs(yMove)) {
            console.log("moving in x axis")
            if (xMove < 0 && (snake.lastDirection !== "right" || snake.length === 1)) {
                snake.direction = "left"
            } else if (xMove > 0 && (snake.lastDirection !== "left" || snake.length === 1)) {
                snake.direction = "right"
            }
        } else if(Math.abs(xMove) < Math.abs(yMove)){ //this isnt an else block incase the finger sits on the screen and doesn't move
            if (yMove < 0 && (snake.lastDirection !== "down" || snake.length === 1)) {
                snake.direction = "up"
            } else if (yMove > 0 && (snake.lastDirection !== "up" || snake.length === 1)) {
                snake.direction = "down"
            }
        }
    }

    lastTouch = touch;
});
