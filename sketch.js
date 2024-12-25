let video;
let bodyPose;
let poses = [];
let connections;
let tree = {
  x: 320,
  y: 240,
  size: 200,
  emoji: "🎄", // Christmas tree emoji
};
let emojis = []; // Array to store emojis
let hits = 0;
let startTime;
let taskCompleted = false;
let treeGrowing = false;
let previousHit = false; // To track if the hand has left the tree
let gameActive = true; // Control game interaction

function preload() {
  bodyPose = ml5.bodyPose("BlazePose", { flipped: true });
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  bodyPose.detectStart(video, gotPoses);
  connections = bodyPose.getSkeleton();
  startTime = millis();
  textFont('Georgia'); // Set a decorative font for the text
}

function draw() {
  background(220);
  image(video, 0, 0);

  // Display countdown timer
  let elapsedTime = millis() - startTime;
  let timeRemaining = Math.max(0, Math.ceil((10000 - elapsedTime) / 1000)); // Countdown in seconds
  fill(34, 139, 34); // Green color
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Time Remaining: ${timeRemaining}s`, 10, 10);
  text(`Hits: ${hits}`, 10, 40);

  if (!gameActive) {
    if (taskCompleted) {
      fill(34, 139, 34); // Green color for "Congratulations!"
      textSize(32);
      textAlign(CENTER, CENTER);
      text("🧑‍🎄Congratulations!🎄", width / 2, height / 2 - 40);
      fill(255, 0, 0); // Red color for the rest of the text
      text("🎁You received gifts from Santa Claus!🎁", width / 2, height / 2);
      text("❄️Click to play again!❄️", width / 2, height / 2 + 40);
    } else {
      fill(255, 0, 0); // Red color for failure message
      textSize(32);
      textAlign(CENTER, CENTER);
      text("🎁Let's get more gifts!🎁", width / 2, height / 2 - 40);
      fill(34, 139, 34); // Green color for retry message
      text("🧑‍🎄Click to try again!🧑‍🎄", width / 2, height / 2 + 40);
    }
    return;
  }

  // Draw the Christmas tree
  textSize(tree.size);
  textAlign(CENTER, CENTER);
  text(tree.emoji, tree.x, tree.y);

  if (poses.length > 0) {
    let pose = poses[0];
    let currentHit = false;

    // Define hand keypoints
    const handKeypoints = ["right_wrist", "left_wrist", "right_index", "left_index", "right_pinky", "left_pinky", "right_thumb", "left_thumb"];

    // Check if any hand keypoint hits the tree
    for (let i = 0; i < pose.keypoints.length; i++) {
      let keypoint = pose.keypoints[i];

      if (handKeypoints.includes(keypoint.name)) {
        if (
          keypoint.confidence > 0.1 &&
          dist(keypoint.x, keypoint.y, tree.x, tree.y) < tree.size / 2
        ) {
          currentHit = true;
          if (!previousHit && !treeGrowing) {
            hits++;
            treeGrowing = true;
            tree.size = 300; // Temporarily enlarge the tree
            setTimeout(() => {
              tree.size = 200; // Reset size after 200ms
              treeGrowing = false;
            }, 200);
            addRandomEmojis(tree.x, tree.y); // Add emojis
          }
        }
      }
    }

    previousHit = currentHit; // Update previousHit status
  }

  // Draw flying emojis
  for (let i = emojis.length - 1; i >= 0; i--) {
    let emoji = emojis[i];
    textSize(32);
    text(emoji.char, emoji.x, emoji.y);
    emoji.y += emoji.vy;
    emoji.x += emoji.vx;
    if (emoji.y > height || emoji.x < 0 || emoji.x > width) {
      emojis.splice(i, 1); // Remove emoji if it goes off-screen
    }
  }

  // Check for task completion
  if (!taskCompleted && millis() - startTime > 10000) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    if (hits >= 15) {
      taskCompleted = true;
      gameActive = false;
    } else {
      gameActive = false;
    }
  }
}

function mousePressed() {
  if (!gameActive) {
    resetGame();
  }
}

function gotPoses(results) {
  poses = results;
}

function addRandomEmojis(x, y) {
  let christmasEmojis = ["\uD83C\uDF84", "\u2744\uFE0F", "\uD83C\uDF81", "\uD83C\uDF85", "\uD83C\uDF89"];
  for (let i = 0; i < 10; i++) { // Increase number of emojis
    emojis.push({
      x: x + random(-50, 50), // Increase scatter range
      y: y + random(-50, 50),
      vy: random(-3, -7), // Increase velocity
      vx: random(-3, 3),
      char: random(christmasEmojis),
    });
  }
}

function resetGame() {
  hits = 0;
  startTime = millis();
  taskCompleted = false;
  gameActive = true;
}
