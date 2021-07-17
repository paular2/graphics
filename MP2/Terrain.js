
/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        
        this.minZ= 10;
        this.maxZ = -10;
        
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        //this.printBuffers();
        
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);
        this.vBuffer[vid] = v[0];
        this.vBuffer[vid+1] = v[1];
        this.vBuffer[vid+2] = v[2];
        
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);
        v[0] = this.vBuffer[vid];
        v[1] = this.vBuffer[vid+1];
        v[2] = this.vBuffer[vid+2];
    }
    getHeightMin() // returns the min and max z
    {
        return this.minZ;
    }
    getHeightMax() // returns the min and max z
    {
        return this.maxZ;
    }
    
    /**
    * Send the buffer objects to WebGL for rendering 
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }
    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }
/**
 * Fill the vertex and buffer arrays 
 */    
generateTriangles()
{
    //Your code here
    var deltaX = (this.maxX - this.minX)/this.div;
    var deltaY = (this.maxY - this.minY)/this.div;
    for(var i = 0; i <= this.div; i++)
    {
        for(var j = 0; j <= this.div; j++)
        {
            this.vBuffer.push(this.minX+deltaX*j);
            this.vBuffer.push(this.minY+deltaY*i);
            this.vBuffer.push(0);
            
            this.nBuffer.push(0);
            this.nBuffer.push(0);
            this.nBuffer.push(0); //SET TO 0 AFTER NORMALS ARE DONE!!
        }
    }
    this.partitionHeight();
    for(var i = 0; i < this.div; i++)
    {
        for(var j = 0; j < this.div; j++)
        {
            var vid = i*(this.div+1)+j;
            this.fBuffer.push(vid);
            this.fBuffer.push(vid+1);
            this.fBuffer.push(vid+this.div+1);
            
            this.fBuffer.push(vid+1);
            this.fBuffer.push(vid+1+this.div+1);
            this.fBuffer.push(vid+this.div+1);
        }
    }
    //
    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
    
    this.generateNormals();
}
    
partitionHeight()   // Changes the height
{
    var iter = 175;
    var delta = .00375;
    for(var k = 0; k < iter; k++)
    {
        var p = [Math.random()*(this.maxX-this.minX)+this.minX,Math.random()*(this.maxY-this.minY)+this.minY];
        
        var n = [Math.random()*2-1,Math.random()*2-1];
        
        for(var j = 0; j <= this.div; j++)
        {
            for(var i = 0; i <= this.div; i++)
            {
                var h = [];
                this.getVertex(h,i,j);
                
                if((h[0]-p[0])*n[0] + (h[1]-p[1])*n[1] > 0)
                {
                    h[2] += delta;    
                }
                if((h[0]-p[0])*n[0] + (h[1]-p[1])*n[1] < 0)
                {
                    h[2] -= delta;    
                }
                
                if(h[2] < this.minZ) // Checks each coordinate for the minimum height
                {
                    this.minZ = h[2];    
                }
                if(h[2] > this.maxZ) // Checks each coordinate for the maximum height
                {
                    this.maxZ = h[2];    
                }
                
                this.setVertex(h,i,j);
            }
        }
    }
}
    
generateNormals() // Calculates the normals after terrain is changed
{
    for(var f = 0; f < this.numFaces; f++)
    {
        var normal = glMatrix.vec3.create();
        var v1Index = this.fBuffer[f*3];     // Vertex index
        var v2Index = this.fBuffer[f*3+1];
        var v3Index = this.fBuffer[f*3+2];
        
        var v1 = glMatrix.vec3.fromValues(this.vBuffer[v1Index*3],this.vBuffer[v1Index*3+1],this.vBuffer[v1Index*3+2]);
        var v2 = glMatrix.vec3.fromValues(this.vBuffer[v2Index*3],this.vBuffer[v2Index*3+1],this.vBuffer[v2Index*3+2]);
        var v3 = glMatrix.vec3.fromValues(this.vBuffer[v3Index*3],this.vBuffer[v3Index*3+1],this.vBuffer[v3Index*3+2]);
        
        var N1 = glMatrix.vec3.create();
        glMatrix.vec3.subtract(N1,v2,v1);
        
        var N2 = glMatrix.vec3.create();
        glMatrix.vec3.subtract(N2,v3,v1);
        
        glMatrix.vec3.cross(normal,N1,N2);
        glMatrix.vec3.normalize(normal, normal);
        
        var norV1 = glMatrix.vec3.fromValues(normal[0]+this.nBuffer[v1Index*3], normal[1]+this.nBuffer[v1Index*3+1], normal[2]+this.nBuffer[v1Index*3+2]);
        glMatrix.vec3.normalize(norV1,norV1); // Normalize V1 + normal

        var norV2 = glMatrix.vec3.fromValues(normal[0]+this.nBuffer[v2Index*3], normal[1]+this.nBuffer[v2Index*3+1], normal[2]+this.nBuffer[v2Index*3+2]);
        glMatrix.vec3.normalize(norV2,norV2); // Normalize V2 + normal
        
        var norV3 = glMatrix.vec3.fromValues(normal[0]+this.nBuffer[v3Index*3], normal[1]+this.nBuffer[v3Index*3+1], normal[2]+this.nBuffer[v3Index*3+2]);
        glMatrix.vec3.normalize(norV3,norV3); // Normalize V3 + normal

        
        this.nBuffer[v1Index*3] = norV1[0];
        this.nBuffer[v1Index*3+1] = norV1[1];
        this.nBuffer[v1Index*3+2] = norV1[2];
        
        this.nBuffer[v2Index*3] = norV2[0];
        this.nBuffer[v2Index*3+1] = norV2[1];
        this.nBuffer[v2Index*3+2] = norV2[2];
        
        this.nBuffer[v3Index*3] = norV3[0];
        this.nBuffer[v3Index*3+1] = norV3[1];
        this.nBuffer[v3Index*3+2] = norV3[2];
        
        
    }
}
    


/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
        for(var i=0;i<this.numVertices;i++)
          {
           console.log("n ", this.nBuffer[i*3], " ", 
                             this.nBuffer[i*3 + 1], " ",
                             this.nBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }
        
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }
    
}
    
}
