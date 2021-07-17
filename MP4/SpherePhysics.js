// This file contains the object that handles the randomization, 
// position, and velocity of each sphere
// Also handles the Euler integration for the position and velocity
// Velocity is changed from gravity and drag



class SpherePhysics
{
    constructor()
    {
        this.radius = Math.random() * 2 + .75;
          
        this.position = vec3.fromValues(Math.random()*30-15,Math.random()*30-15,Math.random()*30-45);
        
        this.velocity = vec3.fromValues(Math.random()*.1-.05,Math.random()*.1-.05,Math.random()*.1-.05);
        
        
        this.color = [Math.random(), Math.random(), Math.random()];
    }
    update(time)
    {
        
        this.HandleCollision();
        
        //console.log("time elapsed", time);
        
        this.velocity = vec3.add(this.velocity, this.velocity, vec3.fromValues(0,-.00025*time,0)); // Velocity Change due to gravity
        
        this.velocity = vec3.scale(this.velocity, this.velocity, Math.pow(.9999, time)); // Velocity change due to drag
        
        var distance = vec3.create();
        distance = vec3.scale(distance, this.velocity, time);
        this.position = vec3.add(this.position, this.position, distance); // Update position from velocity
        
    }
    // Checks if the sphere goes past a certain boundary and reflects velocity on that axis
    HandleCollision()
    {
        var x = this.position[0];
        var y = this.position[1];
        var z = this.position[2];
        var r = this.radius;
        
        if(x >= 25-r)
        {
            this.velocity[0] = -this.velocity[0];
            this.position[0] = 25-r;
        }
        if(x <= -25+r)
        {
            this.velocity[0] = -this.velocity[0];
            this.position[0] = -25+r;
        }
        if(y >= 25-r)
        {
            this.velocity[1] = -this.velocity[1];
            this.position[1] = 25-r;
        }
        if(y <= -25+r)
        {
            this.velocity[1] = -this.velocity[1];
            this.position[1] = -25+r
        }
        if(z >= -15-r)
        {
            this.velocity[2] = -this.velocity[2];
            this.position[2] = -15-r;
        }
        if(z <= -65+r)
        {
            this.velocity[2] = -this.velocity[2];
            this.position[2] = -65+r;
        }
        //console.log("VELy", this.velocity[1]);
        //console.log("rad", this.radius);
    }
}