class AnimationController {
    constructor() {
        this.animations = [];
    }

    createAnimation(animation, object) {
        animation = animation.split('\n');

        for (let i = 0; i < animation.length; i++) {
            if (animation[i] === "") {
                animation.splice(i, 1);
                i--;
                continue;
            }
            animation[i] = animation[i].split(' ');
        }

        this.animations.push(new Animation(animation, object));
    }

    update() {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].currentStep < 0) { // Animation stopped and should be removed
                this.animations.splice(i, 1);
                i--;
                continue;
            }
            
            if (this.animations[i].currentStep >= this.animations[i].animation.length)
                this.animations[i].currentStep = 0; // Loop the animation

            this.animations[i].update();
        }
    }

    stopAnimation(object) {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].object === object) {
                this.animations.splice(i, 1);
                return;
            }
        }
        console.error("No animation found for the specified object.");
    }
}