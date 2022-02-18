window.onload = main;

function main() {
    var c = document.getElementById("viewport");
    var ctx = c.getContext("2d");

    c.style.backgroundColor = "grey";
    ctx.fillStyle = "red";

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
        [1, 3, 4],
        [0, 2, 5],
        [1, 3, 6],
        [0, 2, 7],
        [0, 5, 7],
        [1, 4, 6],
        [2, 5, 7],
        [3, 4, 6]
    ]

    var cube_vertex_positions = [
        new Point3(-10, 10, 100),
        new Point3(-10, 10, 120),
        new Point3(10, 10, 120),
        new Point3(10, 10, 100),
        new Point3(-10, -10, 100),
        new Point3(-10, -10, 120),
        new Point3(10, -10, 120),
        new Point3(10, -10, 100)
    ]

    var screen_distance = 100;
    var camera_position = new Point3(0, 0, 0);

    var point_perspective_game  = new Game(ctx);
    point_perspective_game.fps_output = document.querySelector(".fps-counter p");
    point_perspective_game.player = new Object3D(new Point3(0, 0, 110), cube_vertex_positions, cube_edges);
    point_perspective_game.camera_position = new Point3(0, 0, 0);
    point_perspective_game.screen_distance = 100;
    point_perspective_game.start();

    //var game = new Game(ctx);
    //game.fps_output = document.querySelector(".fps-counter p");
    //game.player = new Object3D(new Point3(150, 150, 150), cube_vertices, cube_edges);
    //game.camera = new Point3(0, 0, 0);
    //game.start();

    var stopper = null;
}

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.last_render = 0;
        this.fps_output = null;

        this.player = null;
        this.camera_position = null;
        this.screen_distance = null;

        this.inputs = {}

        this.loop = this.loop.bind(this); // Binding needed for window.RequestFrameAnimation()
    }

    update(progress) { // Called once per frame
        this.fps_output.innerHTML = Math.round(1000 / progress);

        // Directional inputs (WASD + QE)
        if(this.inputs["KeyA"]) {
            this.player.translate(-3, 0, 0);
        }
        if(this.inputs["KeyW"]) {
            this.player.translate(0, 3, 0);
        }
        if(this.inputs["KeyD"]) {
            this.player.translate(3, 0, 0);
        }
        if(this.inputs["KeyS"]) {
            this.player.translate(0, -3, 0);
        }
        if(this.inputs["KeyQ"]) {
            this.player.translate(0, 0, -3);
        }
        if(this.inputs["KeyE"]) {
            this.player.translate(0, 0, 3);
        }

        // Rotational inputs (X-axis YU, Y-axis HJ, Z-axis NM)
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

    draw() { // Called once per frame
        this.ctx.clearRect(0, 0, 1600, 900);

        var vertex_screen_positions = [];

        this.player.vertices.forEach(vertex => {
            // Interpolate x value
            var p1 = new Point2(this.camera_position.x, this.camera_position.z);
            var p2 = new Point2(vertex.x, vertex.z);
            var x = linearInterpolationX(this.screen_distance, p1, p2);
            // Interpolate y value
            var p1 = new Point2(this.camera_position.y, this.camera_position.z);
            var p2 = new Point2(vertex.y, vertex.z);
            var y = linearInterpolationX(this.screen_distance, p1, p2);

            var x_normal = (x / 160 * 1600) + 800;
            var y_normal = (y / 90 * 900) + 450;

            vertex_screen_positions.push(new Point2(x_normal, y_normal));
        })

        this.ctx.beginPath();
        this.player.edges.forEach((vertex, index) => {
            vertex.forEach(connection => {
                this.ctx.moveTo(vertex_screen_positions[index].x, vertex_screen_positions[index].y);
                this.ctx.lineTo(vertex_screen_positions[connection].x, vertex_screen_positions[connection].y);
            })
        })
        this.ctx.closePath();
        this.ctx.stroke();
    }

    loop(timestamp) { // Called once per frame
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

class Camera {
    constructor() {
        this.position = new Point3;
        this.rotation = new Point3;
        this.distance = null;
    }
}

function perspectiveProjection(viewer, vertices) {
    var v = new Point2(0, 0);

    v.x = 0;
}

// Returns y value at x on the line between p1 and p2
function linearInterpolationY(x, p1, p2) {
    return p1.y + ((x - p1.x) * ((p2.y - p1.y) / (p2.x - p1.x)));
}

// Returns x value at y on the line between p1 and p2
function linearInterpolationX(y, p1, p2) {
    return p1.x + ((p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y));
}

// 2D Cartesian point value
class Point2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// 3D Cartesian point value
class Point3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
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
    constructor(position, vertices, edges) {
        this.position = position;
        this.rotation = {
            x_axis: new Point3(position.x + 60, position.y, position.z),
            y_axis: new Point3(position.x, position.y + 60, position.z),
            z_axis: new Point3(position.x, position.y, position.z + 60)
        }
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

    drawInternals(ctx) {
        // Draw object position
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw object rotation
        ctx.beginPath();
        ctx.strokeStyle = "purple";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.rotation.x_axis.x, this.rotation.x_axis.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.rotation.y_axis.x, this.rotation.y_axis.y);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.rotation.z_axis.x, this.rotation.z_axis.y);
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = "black";

    }

    translate(dx, dy, dz) {
        this.position.x += dx;
        this.position.y -= dy;
        this.position.z += dz;

        this.vertices.forEach(vertex => {
            vertex.x += dx;
            vertex.y -= dy;
            vertex.z += dz;
        })

        for(const axis in this.rotation) {
            var vertex = this.rotation[axis];
            vertex.x += dx;
            vertex.y -= dy;
            vertex.z += dz;
        }
    }

    rotate(dx, dy, dz) {
        this.vertices.forEach(vertex => { //For each point in object
            // Move point to object origin
            var x = vertex.x - this.position.x;
            var y = vertex.y - this.position.y;
            var z = vertex.z - this.position.z;

            //Rotate point about x axis
            var y2 = (y * Math.cos(dx)) - (z * Math.sin(dx));
            var z2 = (z * Math.cos(dx)) + (y * Math.sin(dx));
            //Rotate point about y axis
            var x2 = (x * Math.cos(dy)) + (z2 * Math.sin(dy));
            var z3 = (z2 * Math.cos(dy)) - (x * Math.sin(dy));
            //Rotate point about z axis
            var x3 = (x2 * Math.cos(dz)) - (y2 * Math.sin(dz));
            var y3 = (x2 * Math.sin(dz)) + (y2 * Math.cos(dz));

            // Move point back to original position
            vertex.x = x3 + this.position.x;
            vertex.y = y3 + this.position.y;
            vertex.z = z3 + this.position.z;
        })

        // Update axis rotation vertices for object
        for(const axis in this.rotation) {
            var vertex = this.rotation[axis];

            // Move point to object origin
            var x = vertex.x - this.position.x;
            var y = vertex.y - this.position.y;
            var z = vertex.z - this.position.z;

            //Rotate point about x axis
            var y2 = (y * Math.cos(dx)) - (z * Math.sin(dx));
            var z2 = (z * Math.cos(dx)) + (y * Math.sin(dx));
            //Rotate point about y axis
            var x2 = (x * Math.cos(dy)) + (z2 * Math.sin(dy));
            var z3 = (z2 * Math.cos(dy)) - (x * Math.sin(dy));
            //Rotate point about z axis
            var x3 = (x2 * Math.cos(dz)) - (y2 * Math.sin(dz));
            var y3 = (x2 * Math.sin(dz)) + (y2 * Math.cos(dz));

            // Move point back to original position
            vertex.x = x3 + this.position.x;
            vertex.y = y3 + this.position.y;
            vertex.z = z3 + this.position.z;
        }
    }
}