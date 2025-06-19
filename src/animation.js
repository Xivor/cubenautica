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
        
        // console.log(this.rotationTarget, this.object.rotation)
        if (!this.combined && (this.rotationTarget !== null || this.translationTarget !== null)) {
            if (this.rotationTarget !== null)
                if (length(subtract(this.object.rotation, this.rotationTarget)) < 0.5) {
                    this.object.rotationVelocity = vec3(0, 0, 0);
                    this.object.rotation = this.rotationTarget;
                    this.rotationTarget = null;
                    console.error(this.object.rotation)
                }
            if (this.translationTarget !== null)
                if (length(subtract(this.object.translation, this.translationTarget)) < 0.5) {
                    this.object.translationVelocity = vec3(0, 0, 0);
                    this.object.translation = this.translationTarget;
                    this.translationTarget = null;
                }
            return;
        }

        switch (step[0]) {
            case "rotate":
                this.startRotation(step[1].toLowerCase(), parseFloat(step[2]), parseFloat(step[3]), step[4]);
                break;
            
            case "stop":
                this.currentStep = -1;
                return;
                
            default:
                console.error("Unknown animation step:", step);
                break;
        }
        
        if (step[step.length-1] === ";") this.combined = true; // If the step ends with a semicolon, combine movements
        else this.combined = false;
        this.currentStep++;
    }

    startRotation(axis, rotationRadius, rotationAngle, duration) {
        if (axis == "x") axis = vec3(1, 0, 0);
        else if (axis == "y") axis = vec3(0, 1, 0);
        else if (axis == "z") axis = vec3(0, 0, 1);
        else {
            console.error("Invalid rotation axis:", step[1]);
            return;
        }

        if (duration.endsWith("s"))
            duration = parseFloat(duration) * 1000;
        else if (duration.endsWith("ms"))
            duration = parseFloat(duration);
        else if (duration.endsWith("min"))
            duration = parseFloat(duration) * 60 * 1000;
        else {
            console.error("Invalid duration format:", duration);
            return;
        }
        console.log(this.object.rotation)
        if (this.combined)
            this.rotationTarget = modVec3(add(this.rotationTarget, add(this.object.rotation, mult(rotationAngle, axis))), 360);
        else
            this.rotationTarget = modVec3(add(this.object.rotation, mult(rotationAngle, axis)), 360);

        console.error("Target rotation:", this.rotationTarget);

        let rotationVelocity = mult(1000 / duration, mult(rotationAngle, axis));
        this.object.rotationVelocity = add(this.object.rotationVelocity, rotationVelocity);
    }
}