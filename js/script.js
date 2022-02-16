window.onload = main;

function main() {
    var c = document.getElementById("viewport");
    var ctx = c.getContext("2d");

    c.style.backgroundColor = "grey";
    ctx.fillStyle = "red";

    var vertices = [new Point2(100, 100), 
                    new Point2(200, 100), 
                    new Point2(200, 200),
                    new Point2(100, 200)];

    var square = new Object2D(new Point2(150, 150), vertices);

    var cube_vertices = [
        new Point3(0, 0, 1),
        new Point3(0, 0, 2),
        new Point3(0, 1, 1),
        new Point3(0, 1, 2),
        new Point3(1, 0, 1),
        new Point3(1, 0, 2),
        new Point3(1, 1, 1),
        new Point3(1, 1, 2)
    ]

    document.addEventListener("keydown", (event) => {
        var key = event.key;

        if(key === "ArrowLeft") {
            square.translate(-1, 0);
        }
    })

    var game = new Game(ctx);
    game.start();

    var stopper = null;
}

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.last_render = 0;
        this.fps_output = document.querySelector(".fps-counter p");

        this.loop = this.loop.bind(this);
    }

    update(progress) {
        this.fps_output.innerHTML = Math.round(1000 / progress);
    }

    draw() {

    }

    loop(timestamp) {
        var progress = timestamp - this.last_render;

        this.update(progress);
        this.draw();

        this.last_render = timestamp;
        window.requestAnimationFrame(this.loop);
    }

    start() {
        window.requestAnimationFrame(this.loop);
    }
}

function drawVertices(ctx, vertices) {
    ctx.clearRect(0, 0, 1600, 900);
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for(var i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.closePath();
    ctx.fill();
}

function translate(vertices, changeX, changeY) {
    vertices.forEach(vertex => {
        vertex.x += changeX;
        vertex.y += changeY;
    })
}

function rotate(vertices, about, theta) {
    vertices.forEach(vertex => {
        // Modify x, y with respect to origin
        var x = vertex.x - about.x;
        var y = vertex.y - about.y;
        // Perform matrix rotation with respect to origin
        var x2 = (x * Math.cos(theta)) - (y * Math.sin(theta));
        var y2 = (x * Math.sin(theta)) + (y * Math.cos(theta));
        // Modify x, y with respect to about
        vertex.x = x2 + about.x;
        vertex.y = y2 + about.y;
    })
}

function perspectiveProjection(viewer, vertices) {
    var v = new Point2(0, 0);

    v.x = 0;
}

// Returns y value at x on the line between p1 and p2
function linearInterpolation(x, p1, p2) {
    return p1.y + ((x - p1.x) * ((p2.y - p1.y) / (p2.x - p1.x)));
}

// 2D Cartesian point value
function Point2(x, y) {
    this.x = x;
    this.y = y;
}

// 3D Cartesian point value
function Point3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function Object2D(origin, vertices) {
    this.origin = origin;
    this.vertices = vertices;

    this.draw = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y)
        for(var i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        ctx.closePath();
        ctx.stroke();
    }

    this.drawOrigin = function(ctx)  {
        ctx.beginPath();
        ctx.arc(this.origin.x, this.origin.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    this.translate = function(changeX, changeY) {
        this.origin.x += changeX;
        this.origin.y += changeY;

        this.vertices.forEach(vertex => {
            vertex.x += changeX;
            vertex.y += changeY;
        })
    }

    // Performs rotation of changeRad radians about object origin point
    this.rotate = function(changeRad) {
        this.vertices.forEach(vertex => {
            var x = vertex.x - this.origin.x;
            var y = vertex.y - this.origin.y;

            // Matrix rotation
            var x2 = (x * Math.cos(changeRad)) - (y * Math.sin(changeRad));
            var y2 = (x * Math.sin(changeRad)) + (y * Math.cos(changeRad));

            vertex.x = x2 + this.origin.x;
            vertex.y = y2 + this.origin.y;
        })
    }
}