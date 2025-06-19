class Animation {
    constructor(animation, object) {
        this.animation = animation;
        this.object = object;
        this.currentStep = 0;
        this.rotationTarget = null;
        this.translationTarget = null;
        this.combined = false;
    }

    update() {
        let step = this.animation[this.currentStep];
        
        if (!this.combined && (this.rotationTarget !== null || this.translationTarget !== null)) {
            if (this.rotationTarget !== null) {
                let distance = length(subtract(this.object.rotation, this.rotationTarget));
                if (distance < DISTANCE_ACCURACY*2 || distance > 360 - DISTANCE_ACCURACY*2) {
                    this.object.rotationVelocity = vec3(0, 0, 0);
                    this.object.rotation = this.rotationTarget;
                    this.rotationTarget = null;
                }
            }
            if (this.translationTarget !== null) {
                if (length(subtract(this.object.position, this.translationTarget)) < DISTANCE_ACCURACY) {
                    this.object.translationVelocity = vec3(0, 0, 0);
                    this.object.position = this.translationTarget;
                    this.translationTarget = null;
                }
            }
            return;
        }

        switch (step[0]) {
            case "rotate":
                this.startRotation(this.parseAxis(step[1]), parseFloat(step[2]), parseFloat(step[3]), this.parseDuration(step[4]));
                break;

            case "translate":
                this.startTranslation(this.parseAxis(step[1]), parseFloat(step[2]), this.parseDuration(step[3]));
                break;
            
            case "stop":
                this.currentStep = -1;
                return;
                
            default:
                console.error("Unknown animation step:", step);
                break;
        }
        
        this.currentStep++;
        if (step[step.length-1] === ";"){
            this.combined = true; // If the step ends with a semicolon, combine movements
            this.update();
        }
        else this.combined = false;
    }

    startRotation(axis, rotationRadius, rotationAngle, duration) {
        if (this.combined && this.rotationTarget !== null)
            this.rotationTarget = modVec3(add(this.rotationTarget, mult(rotationAngle, axis)), 360);
        else
            this.rotationTarget = modVec3(add(this.object.rotation, mult(rotationAngle, axis)), 360);

        let rotationVelocity = mult(1000 / duration, mult(rotationAngle, axis));
        this.object.rotationVelocity = add(this.object.rotationVelocity, rotationVelocity);
    }

    startTranslation(axis, translationDistance, duration) {
        if (this.combined && this.translationTarget !== null)
            this.translationTarget = add(this.translationTarget, mult(translationDistance, axis));
        else
            this.translationTarget = add(this.object.position, mult(translationDistance, axis));

        let translationVelocity = mult(1000 / duration, mult(translationDistance, axis));
        this.object.translationVelocity = add(this.object.translationVelocity, translationVelocity);
    }

    parseAxis(axis) {
        axis = axis.toLowerCase();
        if (axis == "x") return vec3(1, 0, 0);
        else if (axis == "y") return vec3(0, 1, 0);
        else if (axis == "z") return vec3(0, 0, 1);
        else {
            console.error("Invalid axis:", axis);
            return null;
        }
    }

    parseDuration(duration) {
        if (duration.endsWith("ms"))
            return parseFloat(duration);
        else if (duration.endsWith("s"))
            return parseFloat(duration) * 1000;
        else if (duration.endsWith("min"))
            return parseFloat(duration) * 60 * 1000;
        else {
            console.error("Invalid duration format:", duration);
            return null;
        }
    }
}