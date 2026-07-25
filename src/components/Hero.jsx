import heroImage from "../assets/images/gemini-2.5-flash-image_create_a_subtle_calming_watercolour_background_using_this_colour_palette_give_it-0.jpg";

export default function Hero(){

    return(
        <section 
          className="hero"
          style={{backgroundImage:`url(${heroImage})`}}
        >

            <div className="overlay">

                <h1>
                    Every person has a story.
                </h1>

                <p>
                    Discover experiences from people around the world.
                </p>

                <button>
                    Explore Stories
                </button>

            </div>

        </section>
    )
}