uniform sampler2D texture;
uniform vec2 resolution;
uniform vec3 cameraPos;
uniform float time;

struct ray
{
    vec3 origin;
    vec3 direction;
};

float hitSphere(vec3 pos,float radius, ray r)
{
    float a = dot(r.direction,r.direction);
    float b = dot(-2.*r.direction,(pos-r.origin));
    float c = dot((pos-r.origin),(pos-r.origin))-radius*radius;
    float discriminant = b*b-4.*a*c;
    if (discriminant >=0.)
        return (-b-sqrt(discriminant))/2.*a; //return the x, where x*ray.direction is the intersection point on the sphere
    return -1.;
}

vec3 rayColour(ray r)
{
    //return normalize(r.direction);
    float a = 0.5*(normalize(r.direction).y+1.);
    float t = hitSphere(vec3(0.,0.,-2.),0.5,r);
    if (t>0.) {
        vec3 hitpos = r.direction*t+r.origin;
        vec3 normal = normalize(hitpos-vec3(0.,0.,-2.));
        return 0.5*(normal+vec3(1.,1.,1.));
    }
    return (1.-a)*vec3(1.)+a*vec3(0.,0.,1.);
}

const float focalLength = 1.;
const float viewportScale = 1.;

void main()
{
    // lookup the pixel in the texture
    vec4 pixel = texture2D(texture, gl_TexCoord[0].xy);

    // multiply it by the color
    //gl_FragColor = gl_Color;
    //vec2 uv = gl_FragCoord.xy/resolution; square aspect ratio
    vec2 uv = gl_FragCoord.xy/resolution.y;
    vec3 viewport = vec3((uv.x-resolution.x/resolution.y/2.)*viewportScale,(uv.y-0.5)*viewportScale,-focalLength);
    ray viewRay = ray(cameraPos,viewport);
    //gl_FragColor = vec4(uv,0.,1.);
    gl_FragColor=vec4(rayColour(viewRay),1.);
}
