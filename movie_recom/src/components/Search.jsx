import React from "react";

const Search = (props) => {

    return(
        <div className="search">
            <div>
                <img src="/search.svg" alt="search" />

                <input type="text" 
                        placeholder="Search through thousands of movies!" 
                        value={props.searchTerm} 
                        onChange={(e) => props.setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
}

export default Search;