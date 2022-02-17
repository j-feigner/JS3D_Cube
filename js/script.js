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

    var vertices3 = [new Point3(100, 100, 0), 
                    new Point3(200, 100, 0), 
                    new Point3(200, 200, 0),
                    new Point3(100, 200, 0)];

    var cube_vertices = [
        new Point3(100, 100, 100),
        new Point3(100, 100, 200),
        new Point3(100, 200, 100),
        new Point3(100, 200, 200),
        new Point3(200, 100, 100),
        new Point3(200, 100, 200),
        new Point3(200, 200, 100),
        new Point3(200, 200, 200)
    ]

    var cube_edges = [
        [1, 2, 4],
        [0, 3, 5],
        [0, 3, 6],
        [1, 2, 7],
        [0, 5, 6],
        [1, 4, 7],
        [2, 4, 7],
        [3, 5, 6]
    ]

    var game = new Game(ctx);
    game.fps_output = document.querySelector(".fps-counter p");
    game.player = new Object3D(new Point3(150, 150, 150), cube_vertices, cube_edges);
    game.start();

    var stopper = null;
}

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.last_render = 0;
        this.fps_output = null;

        this.player = null;

        this.camera = null;

        this.inputs = {}

        this.loop = this.loop.bind(this);
    }

    update(progress) {
        this.fps_output.innerHTML = Math.round(1000 / progress);

        if(this.inputs["ArrowLeft"]) {
            this.player.translate(-3, 0, 0);
        }
        if(this.inputs["ArrowUp"]) {
            this.player.translate(0, 3, 0);
        }
        if(this.inputs["ArrowRight"]) {
            this.player.translate(3, 0, 0);
        }
        if(this.inputs["ArrowDown"]) {
            this.player.translate(0, -3, 0);
        }

        if(this.inputs["KeyM"]) {
            this.player.rotate(0, 0, 0.01);
        }
        if(this.inputs["KeyN"]) {
            this.player.rotate(0, 0, -0.01);
        }

        if(this.inputs["KeyJ"]) {
            this.player.rotate(0, 0.01, 0);
        }
        if(this.inputs["KeyH"]) {
            this.player.rotate(0, -0.01, 0);
        }

        if(this.inputs["KeyU"]) {
            this.player.rotate(0.01, 0, 0);
        }
        if(this.inputs["KeyY"]) {
            this.player.rotate(-0.01, 0, 0);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, 1600, 900);
        this.player.draw(this.ctx);
    }

    loop(timestamp) {
        var progress = timestamp - this.last_render;

        this.update(progress);
        this.draw();

        this.last_render = timestamp;
        window.requestAnimationFrame(this.loop);
    }

    start() {
        window.addEventListener("keydown", (event) => {
            this.inputs[event.code] = true;
        })
        window.addEventListener("keyup", (event) => {
            this.inputs[event.code] = false;
        })

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
        this.origin.y -= changeY;

        this.vertices.forEach(vertex => {
            vertex.x += changeX;
            vertex.y -= changeY;
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

class Object3D {
    constructor(origin, vertices, edges) {
        this.origin = origin;
        this.vertices = vertices;
        this.edges = edges;
    }

    draw(ctx) {
        ctx.beginPath();
        this.edges.forEach((vertex, index) => {
            vertex.forEach(connection => {
                ctx.moveTo(this.vertices[index].x, this.vertices[index].y);
                ctx.lineTo(this.vertices[connection].x, this.vertices[connection].y);
            })
        })
        ctx.closePath();
        ctx.stroke();
    }

    translate(change_x, change_y, change_z) {
        this.origin.x += change_x;
        this.origin.y -= change_y;
        this.origin.z += change_z;

        this.vertices.forEach(vertex => {
            vertex.x += change_x;
            vertex.y -= change_y;
            vertex.z += change_z;
        })
    }

    rotate(dx, dy, dz) {
        this.vertices.forEach(vertex => {
            var x = vertex.x - this.origin.x;
            var y = vertex.y - this.origin.y;
            var z = vertex.z - this.origin.z;

            //rotation about x axis
            var y2 = (y * Math.cos(dx)) - (z * Math.sin(dx));
            var z2 = (z * Math.cos(dx)) + (y * Math.sin(dx));
            //rotation about y axis
            var x2 = (x * Math.cos(dy)) + (z2 * Math.sin(dy));
            var z3 = (z2 * Math.cos(dy)) - (x * Math.sin(dy));
            //rotation about z axis
            var x3 = (x2 * Math.cos(dz)) - (y2 * Math.sin(dz));
            var y3 = (x2 * Math.sin(dz)) + (y2 * Math.cos(dz));

            vertex.x = x3 + this.origin.x;
            vertex.y = y3 + this.origin.y;
            vertex.z = z3 + this.origin.z;
        })
    }
}