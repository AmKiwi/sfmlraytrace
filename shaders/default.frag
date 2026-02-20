#version 330 core
uniform sampler2D texture;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform float time;

int recursionLimit = 8;
struct ray
{
    vec3 origin;
    vec3 direction;
};

struct sphere 
{
    vec3 pos;
    float radius;
    vec3 colour;
    vec3 emission;
};


sphere spheres[2] = sphere[](
    sphere(vec3(0.,0.,-2.),0.5,vec3(0.2,0.4,0.8),vec3(0.)),
    sphere(vec3(-1.,-0.5,-4.),0.75,vec3(0.75,0.75,0.1),vec3(1.))
);

float hitSphere(sphere s, ray r)
{
    vec3 dis = vec3(s.pos-r.origin);
    float a = dot(r.direction,r.direction);
    float b = dot(-2.*r.direction,dis);
    float c = dot(dis,dis)-s.radius*s.radius;
    float discriminant = b*b-4.*a*c;
    if (discriminant >=0.)
        return (-b-sqrt(discriminant))/2.*a; //return the x, where x*ray.direction is the intersection point on the sphere
    return -1.;
}

vec3 rayColour(ray r)
{
    for (int i = 0; i < recursionLimit; i++) {

    }
    //return normalize(r.direction);
    float closestHit = 1./0.;
    int sphereHit = -1;
    for (int i = 0; i < spheres.length(); i++) {
        float hit = hitSphere(spheres[i],r);
        if (closestHit > hit && hit >= 0.) {
            closestHit = hit;
            sphereHit = i;
        }
    }
    if (sphereHit != -1) {
        //if (iter > 2) return vec3(0.);
        vec3 hitpos = r.direction*closestHit+r.origin;
        vec3 normal = normalize(hitpos-spheres[sphereHit].pos);
        //return 0.5*(normal+vec3(1.,1.,1.));
        return spheres[sphereHit].colour*(dot(-normal,vec3(0.,-1.,0.))+1.)/2.;
        //return rayColour(ray(hitpos,normalize(reflect(r.direction,normal))),iter+1);
    }
    float a = 0.5*(normalize(r.direction).y+1.);
    return (1.-a)*vec3(1.)+a*vec3(0.,0.,1.);
}

const float focalLength = 1.;
const float viewportScale = 1.;

void main()
{
    // lookup the pixel in the texture
    //vec4 pixel = texture2D(texture, gl_TexCoord[0].xy);

    // multiply it by the color
    //gl_FragColor = gl_Color;
    //vec2 uv = gl_FragCoord.xy/resolution; square aspect ratio
    vec2 uv = gl_FragCoord.xy/resolution.y;
    vec3 viewport = vec3((uv.x-resolution.x/resolution.y/2.)*viewportScale,(uv.y-0.5)*viewportScale,-focalLength);
    ray viewRay = ray(cameraPos,normalize(viewport));
    //gl_FragColor = vec4(uv,0.,1.);
    gl_FragColor=vec4(rayColour(viewRay),1.);
}
