#version 330 core
uniform sampler2D texture;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform float time;
uniform mat3 cameraRotation;

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

float ranNum(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

sphere spheres[1] = sphere[](
  sphere(vec3(0.,0.,-2.),0.5,vec3(0.2,0.4,0.8),vec3(0.))
//  sphere(vec3(-1.,-0.5,-4.),0.75,vec3(1.),vec3(1.))
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
  vec3 energy = vec3(1.,1.,1.);
  ray tracingRay = r;
  for (int i = 0; i < 8; i++) {
    float closestHit = 1./0.;
    int sphereHit = -1;
    for (int i = 0; i < spheres.length(); i++) {
      float hit = hitSphere(spheres[i],tracingRay);
      if (hit >= 0.) {
        closestHit = hit;
        sphereHit = i;
        vec3 hitpos = r.direction*closestHit+r.origin;
        vec3 normal = normalize(hitpos-spheres[sphereHit].pos);
        return vec3(ranNum(vec2(normal.x+normal.y,1.)));
      }
      if (closestHit > hit && hit >= 0.) {
        closestHit = hit;
        sphereHit = i;
      }
    }
    if (sphereHit != -1) {
      vec3 hitpos = r.direction*closestHit+r.origin;
      vec3 normal = normalize(hitpos-spheres[sphereHit].pos);
      tracingRay = ray(hitpos,reflect(tracingRay.direction,normal));
      energy *=spheres[sphereHit].colour;
      if (length(spheres[sphereHit].emission)>0.)
        return energy*spheres[sphereHit].emission;
    } else {
      return energy*vec3(0.3,0.2,0.7);
    }
  }
  return vec3(0.);
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
    ray viewRay = ray(cameraPos,normalize(viewport*cameraRotation));
    //gl_FragColor = vec4(uv,0.,1.);
    gl_FragColor=vec4(rayColour(viewRay),1.);
    //gl_FragColor=vec4(vec3(ranNum(viewRay.direction.xy)),1.);
}
