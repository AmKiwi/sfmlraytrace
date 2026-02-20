#include <iostream>
#include <SFML/Graphics.hpp>
#include <cmath>
using namespace std;

sf::Vector3f getMovementDir() {
  sf::Vector3f movementVec(0.,0.,0.);
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::A)) {
    movementVec += sf::Vector3f(-1.,0.,0.);
  }
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::D)) {
    movementVec += sf::Vector3f(1.,0.,0.);
  }
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::W)) {
    movementVec += sf::Vector3f(0.,0.,-1.);
  }
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::S)) {
    movementVec += sf::Vector3f(0.,0.,1.);
  }
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Space)) {
    movementVec += sf::Vector3f(0.,1.,0.);
  }
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::LShift)) {
    movementVec += sf::Vector3f(0.,-1.,0.);
  }
  if (movementVec.length() == 0.)
    return movementVec;
  return movementVec.normalized();
}

sf::Vector2f getMouse(sf::RenderWindow& window) {
  sf::Vector2f mousePos(sf::Mouse::getPosition(window));
  sf::Vector2f windowSize(window.getSize());
  return sf::Vector2f(mousePos.x/windowSize.x-0.5,mousePos.y/windowSize.y-0.5);
}

sf::Vector3f rotateVector(sf::Vector3f vec, float rot) {
  return sf::Vector3f(cos(rot)*vec.x-sin(rot)*vec.z,vec.y,sin(rot)*vec.x+cos(rot)*vec.z);
}

int main()
{
  cout << "Initializing window." << endl;
  sf::RenderWindow window(sf::VideoMode({600, 400}), "Raytracing");
  sf::RectangleShape shape({600.0f,400.f});
  shape.setFillColor(sf::Color::Red);

  sf::RenderTexture renderTexture(window.getSize());

  sf::Shader mainShader;
  if (!mainShader.loadFromFile("shaders/default.frag", sf::Shader::Type::Fragment))
  {
    cout << "Loading Shader from shaders/default.frag failed." << endl;
    return -1;
  }


  window.setMouseCursorGrabbed(true);
  window.setMouseCursorVisible(false);
  sf::Clock clock;
  float lastFrame = 0.;

  sf::Vector3f cameraPosition(0.,0.,0.);
  sf::Vector2f rot(0.,0.); //x is yaw, pitch is y
  sf::Glsl::Mat3 cameraRotation({
    1.,0.,0.,
    0.,1.,0.,
    0.,0.,1.
  });
  while (window.isOpen())
  {
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Escape))
      window.close();

    float delta = clock.getElapsedTime().asSeconds()-lastFrame;
    lastFrame = clock.getElapsedTime().asSeconds();
    while (const optional event = window.pollEvent())
    {
      if (event->is<sf::Event::Closed>()) {
        cout << "Closing window." << endl;
        window.close();
      }
      if (event->is<sf::Event::Resized>())
      {
        auto size = window.getSize();
        /*if (!renderTexture.resize(size))
            return -1;
        window.setView(sf::View(
            {0.f, 0.f, (float)size.x, (float)size.y}
        ));*/
      }
      if (const auto* mouseMovedRaw = event->getIf<sf::Event::MouseMovedRaw>()) {
        rot += sf::Vector2f(-mouseMovedRaw->delta.x/500.,-mouseMovedRaw->delta.y*0.);
      }
    }
    //rot = sf::Vector2f(getMouse(window).x*3.,getMouse(window).y*3.);
    cameraPosition += rotateVector(getMovementDir()*delta,-rot.x);
    //cameraPosition += getMovementDir()*delta;
    cameraRotation = sf::Glsl::Mat3({
       cos(rot.x), sin(rot.y)*sin(rot.x), -sin(rot.x)*cos(rot.y),
       0.,cos(rot.y),sin(rot.y),
       sin(rot.x),sin(rot.y)*-cos(rot.x),cos(rot.x)*cos(rot.y)
    });

    mainShader.setUniform("resolution",sf::Vector2f(600.,400.));
    mainShader.setUniform("time",clock.getElapsedTime().asSeconds());
    mainShader.setUniform("cameraRotation",cameraRotation);
    mainShader.setUniform("cameraPos",cameraPosition);
    mainShader.setUniform("texture",renderTexture.getTexture());
    //renderTexture.clear();
    renderTexture.draw(shape, &mainShader);
    renderTexture.display();
    sf::Sprite sprite(renderTexture.getTexture());
    window.clear();
    window.draw(sprite);
    window.display();
  }
  return 0;
}
