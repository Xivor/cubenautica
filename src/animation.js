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
                    this.object.offsetRotation.center = null;
                    this.translationTarget = null;
                }
            }
            return;
        }

        switch (step[0]) {
            case "rotate":
                this.startRotation(
                    this.parseAxis(step[1]),
                    vec3(parseFloat(step[2]), parseFloat(step[3]), parseFloat(step[4])),
                    parseFloat(step[5]),
                    this.parseDuration(step[6])
                );
                break;

            case "translate":
                this.startTranslation(
                    this.parseAxis(step[1]),
                    parseFloat(step[2]),
                    this.parseDuration(step[3])
                );
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

    startRotation(axis, rotationCenter, rotationAngle, duration) {
        if (this.combined && this.rotationTarget !== null)
            this.rotationTarget = modVec3(add(this.rotationTarget, mult(rotationAngle, axis)), 360);
        else
            this.rotationTarget = modVec3(add(this.object.rotation, mult(rotationAngle, axis)), 360);

        let rotationVelocity = mult(1000 / duration, mult(rotationAngle, axis));
        this.object.rotationVelocity = add(this.object.rotationVelocity, rotationVelocity);

        if (length(rotationCenter) != 0 && length(subtract(rotationCenter, this.object.position)) > DISTANCE_ACCURACY) {
            this.object.offsetRotation.center = rotationCenter;
            this.object.offsetRotation.axis = axis;
            this.object.offsetRotation.angleSpeed = rotationAngle * (1000 /duration);

            if (this.translationTarget === null) this.translationTarget = vec3(0, 0, 0);
            if (axis[0] === 1) { // X-axis
                this.object.offsetRotation.angle = this.object.position[1] < rotationCenter[1] ? 180 : 0;
                rotationAngle += this.object.offsetRotation.angle;
                this.translationTarget = add(this.translationTarget,
                    add(rotationCenter, mult(
                        length(subtract(this.object.position, rotationCenter)), 
                        vec3(0, Math.sin(rotationAngle * Math.PI / 180), Math.cos(rotationAngle * Math.PI / 180))
                )));
            }
            else if (axis[1] === 1) { // Y-axis
                this.object.offsetRotation.angle = this.object.position[2] < rotationCenter[2] ? 180 : 0;
                rotationAngle += this.object.offsetRotation.angle;
                this.translationTarget = add(this.translationTarget,
                    add(rotationCenter, mult(
                        length(subtract(this.object.position, rotationCenter)), 
                        vec3(Math.cos(rotationAngle * Math.PI / 180), 0, Math.sin(rotationAngle * Math.PI / 180))
                )));
            }
            else if (axis[2] === 1) { // Z-axis
                this.object.offsetRotation.angle = this.object.position[0] < rotationCenter[0] ? 180 : 0;
                rotationAngle += this.object.offsetRotation.angle;
                this.translationTarget = add(this.translationTarget,
                    add(rotationCenter, mult(
                        length(subtract(this.object.position, rotationCenter)), 
                        vec3(Math.cos(rotationAngle * Math.PI / 180), Math.sin(rotationAngle * Math.PI / 180), 0)
                )));
            }
        }
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