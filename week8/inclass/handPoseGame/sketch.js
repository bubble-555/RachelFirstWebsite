let handPose;//model container
let video;
let hands = [];
let gameBall, gamePaddle;
let score = 0;


async function setup() {
    createCanvas(640, 480);

    video = createCapture(VIDEO,{flipped: true});
    video.size(640, 480);
    video.hide();

    handPose = await ml5.handPose({flipped: true});
    handPose.detectStart(video, gotHands);

    gameBall = new Ball(width*0.5, height*0.5);
    gamePaddle = new Paddle();
}

       

function draw() {
    background(220);
    image(video, 0, 0);


    gameBall.move(gamePaddle);
    gameBall.display();
    gamePaddle.display();

    if(hands[0]){
        gamePaddle.update(hands[0].index_finger_tip, hands[0].thumb_tip);

        fill(255,0,0);
        circle(hands[0].index_finger_tip.x, hands[0].index_finger_tip.y, 15);

        fill(0,255,0);
        circle(hands[0].thumb_tip.x, hands[0].thumb_tip.y, 15);
    }

    textSize(32);
    text(score, 10, 40);
}    
    
   


function gotHands(results){
    console.log(results);
    hands = results;
}

class Paddle{
    constructor(){
        this.pos = createVector(width - 100, 200);
        this.height = 60;
        this.width = 20;
        this.clr = color (255, 0, 0);
    }


    update(point1, point2){
        this.pos.y = point1.y;
        this.height = point2.y - point1.y;
    }

    display(){
        fill(this.clr);
        rect(this.pos.x, this.pos.y, this.width, this.height);
    }

}


class Ball{
    constructor (_x, _y){
        this. pos = createVector(_x, _y)
        this. size = 20
        this. velocity =createVector(random (-4, 4), random(-3, 3))
        this. clr = color(random (255), random (255), random (255))

        this.friendliness = random (70,250)
    }
    move(paddle){
        this. pos.add(this.velocity)

        if (this. pos.x - this. size *0.5 <= 0){
            this.velocity.x *= -1
            this. pos.x = this.size*0.5
            
        }

        if (this.pos.x + this.size * 0.5 >= paddle.pos.x 
            && this.pos.y >= paddle.pos.y 
            && this.pos.y <= paddle.pos.y + paddle.height){
            this.velocity.x *= -1;
            score++;
            
        }

        if (this. pos.x - this. size *0.5 >= width){
            this.pos.x = width* 0.5;
            this.pos.y = height* 0.5;
            score--;
        }



        if (this. pos.y- - this. size *0.5 <= 0 ){
            this.velocity.y *= -1
            this.pos.y = this.size*0.5
        }

        if (this.pos.y + this.size * 0.5 >= height) {
            this.velocity.y *= -1;
            this.pos.y = height - this.size * 0.5;
        }
    }

    display(){
        fill(this.clr)
        circle(this.pos.x, this.pos.y, this.size)
    }


}