#include <iostream>
#include <SFML/Graphics.hpp>
using namespace std;

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


    sf::Clock clock;
    float lastFrame = 0.;

    sf::Vector3f cameraPosition(0.,0.,0.);
    while (window.isOpen())
    {
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
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::A))
        {
            cameraPosition += sf::Vector3f(-delta,0.,0.);
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::D))
        {
            cameraPosition += sf::Vector3f(delta,0.,0.);
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::W))
        {
            cameraPosition += sf::Vector3f(0.,0.,-delta);
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::S))
        {
            cameraPosition += sf::Vector3f(0.,0.,delta);
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Space))
        {
            cameraPosition += sf::Vector3f(0.,delta,0.);
        }
        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Key::LShift))
        {
            cameraPosition += sf::Vector3f(0.,-delta,0.);
        }

        mainShader.setUniform("resolution",sf::Vector2f(600.,400.));
        mainShader.setUniform("time",clock.getElapsedTime().asSeconds());
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
