window.onload = main;

var screen_width = 960;
var screen_height = 540;

var colors = [
    "red",
    "green",
    "blue",
    "purple",
    "yellow",
    "pink",
    "orange",
    "white"
]

function main() {
    var c = document.getElementById("viewport");
    var ctx = c.getContext("2d");

    ctx.fillStyle = "red";

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

    var cube_edge_relationships = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7]
    ]

    var cube_faces = [
        [0, 1, 2, 3],
        [0, 1, 5, 4],
        [0, 3, 7, 4],
        [1, 2, 6, 5],
        [2, 3, 7, 6],
        [4, 5, 6, 7]
    ]

    var point_perspective_game  = new Game(ctx);

    point_perspective_game.fps_output = document.querySelector(".fps-counter p");

    point_perspective_game.player = new Object3D(new Point3(0, 0, 110), cube_vertex_positions, cube_edge_relationships);
    point_perspective_game.player.faces = cube_faces;

    point_perspective_game.camera_position = new Point3(0, 0, 0);
    point_perspective_game.screen_distance = 100;

    point_perspective_game.start();

    var stopper = null;
}

class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.i_buffer = null;
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
            this.player.translate(-1, 0, 0);
        }
        if(this.inputs["KeyW"]) {
            this.player.translate(0, 1, 0);
        }
        if(this.inputs["KeyD"]) {
            this.player.translate(1, 0, 0);
        }
        if(this.inputs["KeyS"]) {
            this.player.translate(0, -1, 0);
        }
        if(this.inputs["KeyQ"]) {
            this.player.translate(0, 0, -1);
        }
        if(this.inputs["KeyE"]) {
            this.player.translate(0, 0, 1);
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
        // Clear screen
        this.ctx.clearRect(0, 0, screen_width, screen_height);

        // Perspective Projection Math
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
            // Normalize xy coordinates to screen
            var x_normal = (x / 96 * screen_width) + (screen_width / 2);
            var y_normal = (y / 54 * screen_height) + (screen_height / 2);

            vertex_screen_positions.push(new Point2(x_normal, y_normal));
        })

        // Draw wireframe from edge list using projected vertex array
        this.ctx.beginPath();
        this.player.edges.forEach(edge => {
            var v1 = vertex_screen_positions[edge[0]];
            var v2 = vertex_screen_positions[edge[1]];

            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y)
        })
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawFaces() {
        // Clear screen
        this.ctx.clearRect(0, 0, screen_width, screen_height);

        // Sort vertices by distance from camera
        var sorted_vertices = this.player.vertices.slice();
        sorted_vertices.sort((a, b) => {
            if(a.z > b.z) {
                return -1;
            }
            if(a.z < b.z) {
                return 1;
            }
            return 0;
        })

        // Perspective Projection Math
        var vertex_screen_positions = [];
        this.player.vertices.forEach(vertex => {
            var projected_vertex = perspectiveProjection(this.camera_position, vertex, this.screen_distance);
            vertex_screen_positions.push(projected_vertex);
        })

        // Draw faces from face list using projected vertex array
        this.player.faces.forEach((face, index) => {
            var v1 = vertex_screen_positions[face[0]];
            var v2 = vertex_screen_positions[face[1]];
            var v3 = vertex_screen_positions[face[2]];
            var v4 = vertex_screen_positions[face[3]];

            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            this.ctx.lineTo(v3.x, v3.y);
            this.ctx.lineTo(v4.x, v4.y);
            this.ctx.lineTo(v1.x, v1.y);
            this.ctx.closePath();

            this.ctx.fillStyle = colors[index];
            this.ctx.fill();
        })
    }

    rasterize(ctx) {
        // Loop through all pixels in image
    }

    loop(timestamp) { // Called once per frame
        var progress = timestamp - this.last_render;

        this.update(progress);
        //this.drawFaces();
        this.draw();

        this.last_render = timestamp;
        window.requestAnimationFrame(this.loop);
    }

    start() {
        var buffer_canvas = document.createElement("canvas");
        buffer_canvas.width = screen_width;
        buffer_canvas.height = screen_height;
        this.i_buffer = buffer_canvas.getContext("2d");

        window.addEventListener("keydown", (event) => {
            this.inputs[event.code] = true;
        })
        window.addEventListener("keyup", (event) => {
            this.inputs[event.code] = false;
        })

        window.requestAnimationFrame(this.loop);
    }
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
        this.faces  = null;
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

// Returns Point2 representing a given Point3 in world space being
// projected onto the camera plane
function perspectiveProjection(camera, vertex, screen_distance) {
    // Interpolate x value
    var p1 = new Point2(camera.x, camera.z);
    var p2 = new Point2(vertex.x, vertex.z);
    var x = linearInterpolationX(screen_distance, p1, p2);
    // Interpolate y value
    var p1 = new Point2(camera.y, camera.z);
    var p2 = new Point2(vertex.y, vertex.z);
    var y = linearInterpolationX(screen_distance, p1, p2);
    // Normalize xy coordinates to screen width/height
    var x_normal = (x / 160 * screen_width) + (screen_width / 2);
    var y_normal = (y / 90 * screen_height) + (screen_height / 2);

    return new Point2(x_normal, y_normal);
}

// Returns y value at x on the line between p1 and p2
function linearInterpolationY(x, p1, p2) {
    return p1.y + ((x - p1.x) * ((p2.y - p1.y) / (p2.x - p1.x)));
}

// Returns x value at y on the line between p1 and p2
function linearInterpolationX(y, p1, p2) {
    return p1.x + ((p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y));
}