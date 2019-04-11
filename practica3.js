window.addEventListener('load', function () {
    
    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({audioSupporter:["mp3", "ogg"]})
        .include("Sprites, Scenes, Input, 2D, Anim, Audio, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({maximize:true, scaleToFit:true, width:1000, height:600})
        // And turn on default input controls and touch input (for UI)
        .controls().touch()
        .enableSound();

    //////////////  ESCENAS     //////////////


    Q.scene('endGame', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Play Again"
        }))
        var label = container.insert(new Q.UI.Text({
            x: 10,
            y: -10 - button.p.h,
            label: stage.options.label
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('mainTitle');
        });
        container.fit(20);
    });



    Q.scene('startGame', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Press enter to play"
        }))
        var label = container.insert(new Q.UI.Text({
            x: 10,
            y: -10 - button.p.h,
            label: stage.options.label
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('mainTitle');
        });
        container.fit(20);
    });


    Q.scene("mainTitle", function (stage) {
        stage.insert(new Q.Repeater({
            asset: "mainTitle.png"
        }));

        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height * 2 / 3,
            fill: "rgba(0,0,0,0.5)"
        }));

        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Play"
        }))

        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('level1');
            Q.stageScene("HUD", 3);
        });

        container.fit(20);
    });


     //////////////    SCORE    //////////////

    
     Q.UI.Text.extend("Score", {
        init: function (p) {
            this._super({
                label: "score: 0",
                x: Q.Player.x,
                y: Q.Player.y
            });
            Q.state.on("change.score", this, "score");
        },
        score: function (score) {
            this.p.label = "score: " + score;
        }
    });

    

    //////////////  MARIO     //////////////

    
    Q.Sprite.extend("Player", {
        init: function (p) {
            this._super(p, {
                sprite: "player_anim",
                sheet: "marioR", 
                direction: "right",
                died: false,
                x: 180, 
                y: 430,
                landed: false, 
                gravity: 0.5, 
                contadorJump:0
            });
            this.add('2d, platformerControls, animation, tween');
            this.on("hit.sprite", function (collision) {
                if (collision.obj.isA("Princess")) {
                    Q.audio.stop("music_main.ogg");
                    Q.audio.play("music_level_complete.ogg");
                    Q.stageScene("endGame", 1, {
                        label: "You Won!"
                    });
                    this.destroy();
                }
            });

        },
        die: function(){
            if(!this.p.died){
                this.p.died= true;
                Q.audio.stop('music_main.ogg'); // Everything will stop playing
                Q.audio.play('music_die.ogg');
                //Animate falling down and destroy
                this.play("dead",1);
                this.animate({ x: this.p.x, y: this.p.y-50, angle: 0 }, 0.25, Q.Easing.Linear);
                this.animate({ x: this.p.x, y: this.p.y + 50, angle: 0 }, 1, Q.Easing.Linear, {delay: 0.5, callback: function() {
                    this.destroy();
                    Q.stageScene("endGame",1, { label: "You Died!" });
                    Q.audio.play('music_game_over.ogg'); }});
            }
        },
        step: function (dt) {
            //Comprueba si Mario muere.
            if (this.p.y > 620 ) {
               this.die();

            }
            if(this.p.vy == 0 && this.p.vx == 0 && !this.p.ignoreControls) {
                this.play("stand_" + this.p.direction);
                this.p.contadorJump = 0;
            } 
            else if(this.p.landed > 0 && !this.p.ignoreControls) {
                    this.play("walk_" + this.p.direction);
                    this.p.contadorJump = 0;
            }
            else if(!this.p.ignoreControls) {               
                this.p.contadorJump++;
                this.play("jump_" + this.p.direction);
            }

            if(this.p.contadorJump == 1){
                Q.audio.play("jump_big.ogg", {loop:false});
            }
            
        },
        win: function() {
                this.del('2d, platformerControls');
                //Play the win music
                Q.audio.stop('music_main.ogg'); // Everything will stop playing
                Q.audio.play('music_level_complete.ogg');
                Q.stageScene("endGame",1, { label: "You Won!" });
            }	 
    });

    Q.animations("player_anim", {
        stand_right: { frames:[0], rate: 1, flip: false},
        stand_left: { frames: [0], rate: 1, flip: "x" },
        walk_right: { frames: [1,2], rate: 0.1, flip: false, loop: false, next: 'stand_right' },
        walk_left: { frames:  [1,2], rate: 0.1, flip: 'x', loop: false, next: 'stand_left' },
        marioJumpR: { frames: [0], rate: 0.1, flip: false },
        jump_right: { frames: [4], rate: 0.5, flip: false },
        jump_left: { frames: [4], rate: 0.5, flip: "x" },
        dead: { frames:[12], rate: 1, flip: false }
     });

     

    //////////////  PRINCESS     //////////////

    
    Q.Sprite.extend("Princess", {

        init: function (p) {
            this._super(p, {
                asset: "princess.png"
            });
            this.add('2d');
            this.on("hit.sprite", this, "hit");
        },

        hit: function (col) {
            if (col.obj.isA("Player")) {
                col.obj.trigger('win');
            }
        }

    });
    

    //////////////  GOOMBA     //////////////

    
    Q.Sprite.extend("Goomba", {
        init: function (p) {
            this._super(p, {
                sprite: "goomba_animations",
                sheet: 'goomba',
                vx: 80
            });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce, animation');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    collision.obj.die();
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    Q.state.inc("score", 10);
                    collision.obj.p.vy = -300;
                    this.destroy();
                    
                }
            });
        }, 
        step: function(dt){
            this.play("walk", 1);
        }
    });
 
    Q.animations("goomba_animations",{
            walk: { frames: [0,1], rate: 0.5, loop: false},
            die:{frames:[0], rate: 0.1, flip: false, loop: false}
    });

    

    //////////////    BLOOPA     //////////////

    
    Q.Sprite.extend("Bloopa", {
        init: function (p) {
            this._super(p, {
                sheet: "bloopa",
                sprite: "bloopa_anim",
                vx: 0,
                gravity:0.2,
                jumpTimer:0
            });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce, animation');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    collision.obj.die();
                }
                if (collision.obj.isA("level1")) {
                    this.p.vy = -1000;
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.play("die");
                    this.destroy();
                    collision.obj.p.vy = 0;
                }
            });

            this.on("bloopa.jumped", this, "jumped");
        },
        step: function(dt) {
            //when step into the floor, stop the X movement
            if(this.p.vy == 0)
                this.p.vx = 0;
      
            this.p.jumpTimer = this.p.jumpTimer + dt;
            if (this.p.jumpTimer > 2) {
              this.play("jump");
              this.p.jumpTimer = 0;
              this.jumped();
            }
        },
        jumped: function(){
            this.p.vy = -175;
            this.p.vx = (Math.random()*100) -50;
        }
    });

    Q.animations("bloopa_anim", {
        stand: { frames: [0], rate: 1/4 },
        jump: { frames: [0,1], rate: 0.7, loop: true},
        die: { frames: [2], rate: 1, loop: false}
    });

    

    //////////////  COIN     //////////////

    
    Q.Sprite.extend("Coin",{
        init: function (p) {
            this._super(p, {
                sheet:"coin",
                sprite: "coin_anim",
                vx:0,
                vy:0,
                gravity:0
            });
            this.add('2d, animation, tween');
            this.on("bump.left,bump.right,bump.bottom, bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.anim();
                    Q.audio.play("coin.ogg");
                }
            });
        },
        step:function(dt){
            this.play("shine",1);
        },
        anim: function(){
            this.animate({ x: this.p.x, y: this.p.y-25, angle: 0 }, 0.25, Q.Easing.Linear, {callback: function() { this.destroy(); }});
        }
    });

    Q.animations("coin_anim", {
        shine:{ frames: [0,1,2], rate: 0.3, loop:true}
    });


    

    //////////////  LOAD     //////////////

    

    Q.load(["levelObject.tmx", "bg.png", "tiles.png", "mario_small.png", "mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json", "princess.png","coin.png", "coin.json", "mainTitle.png", "music_main.ogg", "music_level_complete.ogg", "jump_big.ogg", "coin.ogg", "music_die.ogg", "music_game_over.ogg"], function () {

        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("coin.png", "coin.json");
        Q.compileSheets("goomba.png", "goomba.json");
        Q.compileSheets("bloopa.png", "bloopa.json");
        Q.compileSheets("princess.png", "coin.json");

        Q.sheet("goomba", "goomba.png", {
            tilew: 32,
            tileh: 32,
            sx: 0,
            sy: 0
        });
        Q.sheet("bloopa", "bloopa.png", {
            tilew: 32,
            tileh: 50,
            sx: 0,
            sy: 0
        });
        Q.sheet("player", "mario_small.png", {
            tilew: 24,
            tileh: 32,
            sx: 180,
            sy: 360
        });
        Q.sheet("tiles", "tiles.png", {
            tilew: 32,
            tileh: 32
        });
        Q.sheet("coin", "coin.png", {
            tilew: 34,
            tileh: 34,
            sx: 0,
            sy: 0
        });
        Q.sheet("mainTitle", "mainTitle.png");
        Q.sheet("princess", "princess.png", {
            tilew: 32,
            tileh: 32
        });

      
        

        Q.scene("level1", function (stage) {
            Q.audio.play("music_main.ogg", {loop:true});
            Q.stageTMX("levelObject.tmx", stage);
            stage.insert(new Q.Score());

            var player = stage.insert(new Q.Player());
            stage.insert(new Q.Princess({
                x: 1820,
                y: 460
            }));
            stage.add("viewport").follow(player, {
                x: true
            });
        });
        Q.stageScene("mainTitle");
    });
});