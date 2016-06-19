
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', { preload: preload, create: create, update: update });

var platforms,
    player,
    cursors,
    rubies,
    bullets,
    fireButton,
    startText,
    scoreText;

var score = 0;
var pinkies = [];
var bulletTime = 0;
var lives;
var background;

function preload() {
  game.load.image('sky', 'assets/background02.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('ruby', 'assets/ruby.png');
  game.load.image('bullet', 'assets/bullet.gif');
  game.load.image('heart', 'assets/heart.png');
  game.load.spritesheet('pinky', 'assets/pinky.png', 32, 32);
  game.load.spritesheet('greeny', 'assets/greeny.png', 32, 32);
  game.load.spritesheet('dude', 'assets/enolsheet2.png', 45.5, 64);

}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  background = game.add.tileSprite(0, 0, 800, 600, 'sky');


  platforms = game.add.group();

  platforms.enableBody = true;

  var ground = platforms.create(0, game.world.height - 64, 'ground');

  ground.scale.setTo(2, 2);

  ground.body.immovable = true;

  var ledge = platforms.create(400, 400, 'ground');

  ledge.body.immovable = true;

  ledge = platforms.create(-150, 250, 'ground');

  ledge.body.immovable = true;

  player = game.add.sprite(32, game.world.height - 150, 'dude');

  game.physics.arcade.enable(player);

  player.body.bounce.y = 0.2;
  player.body.gravity.y = 600;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2], 10, true);
  player.animations.add('right', [3, 4, 5], 10, true);

  create_rubies();
  create_pinkies();
  add_lives();
  create_bullets();
  create_texts();

  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.paused = true;
}


function update() {
  var that = this;

  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(rubies, platforms);
  _(pinkies).each(function(pinky){
    game.physics.arcade.collide(pinky.pinky, platforms);
    if (!pinky.badboy){
      game.physics.arcade.collide(pinky.pinky, player);
    }else{
      game.physics.arcade.overlap(player, pinky.pinky, pinkyCrash, null, that);
    }
  });
  game.physics.arcade.overlap(player, rubies, collectRuby, null, this);

  _(pinkies).each(function(pinky){
    if (pinky.alive){
      if (pinky.badboy){
        game.physics.arcade.overlap(bullets, pinky.pinky, bulletHitEnemy, null, this);
      }
      pinky.update();
    }
  });

  player.body.velocity.x = 0;

  if (cursors.left.isDown)
  {
     player.body.velocity.x = -150;
     player.animations.play('left');
  }
  else if (cursors.right.isDown)
  {
     player.body.velocity.x = 150;
     player.animations.play('right');
  }
  else
  {
     player.animations.stop();
     player.frame = 3;
  }


  //  Firing?
  if (fireButton.isDown)
  {
     fireBullet();
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
     player.body.velocity.y = -500;
  }
}

function start_game(){
  startText.visible = false;
  game.paused = false;
}

function create_rubies(){
  rubies = game.add.group();

  rubies.enableBody = true;
  //  Here we'll create 12 of them evenly spaced apart
  for (var i = 0; i < 12; i++)
  {
      //  Create a ruby inside of the 'rubies' group
      var x = game.world.randomX;
      var y = _.random(1, 500);
      var ruby = rubies.create(x, y, 'ruby');
  }
}

function create_pinkies(){
  for (var i = 0; i < 5; i++)
  {
      pinkies.push(new Pinky(game, player, "badboy"));
  }
  for (var i = 0; i < 2; i++)
  {
      pinkies.push(new Pinky(game, player, "goodboy"));
  }
}

function create_bullets(){
  // Bullets creation
  //  Our bullet group
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(100, 'bullet', 0, false);
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 0.5);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);
}

function create_texts(){
  scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000', stroke: '#FFF', strokeThickness: 6 });
  startText = game.add.text(150, 200, 'Click to start\nArrows to move. Spacebar to shoot', { fontSize: '80px', fill: '#000', stroke: '#FFF', strokeThickness: 6, align: 'center' });
  game.input.onTap.addOnce(start_game, this);
  stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { align: 'center', font: '84px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;
}

function add_lives(){
  lives = game.add.group();

  for (var i = 0; i < 3; i++)
  {
    var heart = lives.create(game.world.width - 100 + (30 * i), 60, 'heart');
    heart.anchor.setTo(0.5, 0.5);
    heart.alpha = 0.8;
  }
}


function collectRuby (player, ruby) {
    ruby.kill();
    var x = game.world.randomX;
    var y = _.random(1, 500);
    var ruby = rubies.create(x, y, 'ruby');
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function pinkyCrash(player, pinky){
  pinky.kill();
  pinkies.push(new Pinky(game, player, "badboy"));
  live = lives.getFirstAlive();

  if (live)
  {
    live.kill();
  }

  // When the player dies
  if (lives.countLiving() < 1)
  {
    player.kill();

    stateText.text=" GAME OVER \n Refresh to restart";
    stateText.visible = true;
    game.paused = true;
  }
}

function bulletHitEnemy (pinky, bullet) {
  bullet.kill();
  pinky.kill();
  score += 30;
  scoreText.text = 'Score: ' + score;
  pinkies.push(new Pinky(game, player, "badboy"));
}

function fireBullet () {

  //  To avoid them being allowed to fire too fast we set a time limit
  if (game.time.now > bulletTime)
  {
    //  Grab the first bullet we can from the pool
    bullet = bullets.getFirstExists(false);

    if (bullet)
    {
      //  And fire it
      bullet.reset(player.x + 15, player.y + 35);
      if (player.body.velocity.x < 0) {
        bullet.body.velocity.x = -400;
      }else{
        bullet.body.velocity.x = 400;
      }
      bulletTime = game.time.now + 300;
    }
  }

}
