class Boid extends Object {
  constructor(position, rotation, scale, shader, model) {
    super(position, rotation, scale, shader, model);
    this.velocity = vec3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    this.maxSpeed = 20.0;
    this.maxForce = 0.5;
    this.perceptionRadius = 30.0;
    this.calculateCenter();
  }

  update(delta, boids) {
    const separation = this.separate(boids);
    const alignment = this.align(boids);
    const cohesion = this.cohere(boids);

    const separationForce = mult(1.5, separation);
    const alignmentForce = mult(1.0, alignment);
    const cohesionForce = mult(1.0, cohesion);

    this.velocity = add(this.velocity, separationForce);
    this.velocity = add(this.velocity, alignmentForce);
    this.velocity = add(this.velocity, cohesionForce);

    if (length(this.velocity) > this.maxSpeed) {
      this.velocity = normalize(this.velocity);
      this.velocity = mult(this.maxSpeed, this.velocity);
    }

    this.position = add(this.position, mult(delta, this.velocity));
    this.updateRotation();
    this.applyBoundaries();
  }

updateRotation() {
    if (length(this.velocity) > 0.1) {
      const v = normalize(this.velocity);
      const horizontalSpeed = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
      this.rotation[0] = -Math.atan2(v[2], horizontalSpeed) * 180 / Math.PI;
      this.rotation[1] = 0;
      this.rotation[2] = Math.atan2(v[1], v[0]) * 180 / Math.PI;
    }
  }

  applyBoundaries() {
    for (let i = 0; i < 2; i++) {
      if (this.position[i] < -MAP_LIMIT) {
        this.position[i] = -MAP_LIMIT;
        this.velocity[i] *= -0.5;
      } else if (this.position[i] > MAP_LIMIT) {
        this.position[i] = MAP_LIMIT;
        this.velocity[i] *= -0.5;
      }
    }

    if (this.position[2] < 5) {
      this.position[2] = 5;
      this.velocity[2] = Math.abs(this.velocity[2]) * 0.5;
    } else if (this.position[2] > 50) {
      this.position[2] = 50;
      this.velocity[2] = -Math.abs(this.velocity[2]) * 0.5;
    }
  }

  separate(boids) {
    let steering = vec3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const d = distance(this.position, other.position);
      if (d < this.perceptionRadius / 2) {
        const diff = subtract(this.position, other.position);
        steering = add(steering, normalize(diff));
        count++;
      }
    }

    if (count > 0) {
      steering = div(steering, count);
      steering = normalize(steering);
      steering = mult(this.maxSpeed, steering);
      steering = subtract(steering, this.velocity);

      if (length(steering) > this.maxForce) {
        steering = normalize(steering);
        steering = mult(this.maxForce, steering);
      }
    }

    return steering;
  }

  align(boids) {
    let avgVelocity = vec3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const d = distance(this.position, other.position);
      if (d < this.perceptionRadius) {
        avgVelocity = add(avgVelocity, other.velocity);
        count++;
      }
    }

    if (count > 0) {
      avgVelocity = div(avgVelocity, count);
      avgVelocity = normalize(avgVelocity);
      avgVelocity = mult(this.maxSpeed, avgVelocity);

      const steer = subtract(avgVelocity, this.velocity);
      if (length(steer) > this.maxForce) {
        return mult(this.maxForce, normalize(steer));
      }
      return steer;
    }

    return vec3(0, 0, 0);
  }

  cohere(boids) {
    let centerOfMass = vec3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      if (other === this) continue;

      const d = distance(this.position, other.position);
      if (d < this.perceptionRadius) {
        centerOfMass = add(centerOfMass, other.position);
        count++;
      }
    }

    if (count > 0) {
      centerOfMass = div(centerOfMass, count);
      const desired = subtract(centerOfMass, this.position);
      const desiredNorm = normalize(desired);
      const scaledDesired = mult(this.maxSpeed, desiredNorm);

      const steer = subtract(scaledDesired, this.velocity);
      if (length(steer) > this.maxForce) {
        return mult(this.maxForce, normalize(steer));
      }
      return steer;
    }

    return vec3(0, 0, 0);
  }
}
