import os
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy import create_engine


def get_required_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Falta la variable de entorno obligatoria: {var_name}")
    return value


DATABASE_URL = get_required_env("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    genre: Mapped[str] = mapped_column(String(120), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    director: Mapped[Optional[str]] = mapped_column(String(180), nullable=True)


class MovieCreate(BaseModel):
    title: str
    genre: str
    year: int = Field(ge=1888, le=2100)
    director: Optional[str] = None


class MovieUpdate(BaseModel):
    title: str
    genre: str
    year: int = Field(ge=1888, le=2100)
    director: Optional[str] = None


class MovieResponse(BaseModel):
    id: int
    title: str
    genre: str
    year: int
    director: Optional[str]

    model_config = {
        "from_attributes": True
    }


app = FastAPI(title="Cine API", version="1.0.0")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "service": "cine-api"}


@app.post("/movies", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(payload: MovieCreate, db: Session = Depends(get_db)):
    movie = Movie(
        title=payload.title,
        genre=payload.genre,
        year=payload.year,
        director=payload.director,
    )

    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


@app.get("/movies", response_model=List[MovieResponse])
def list_movies(db: Session = Depends(get_db)):
    return db.query(Movie).order_by(Movie.id.desc()).all()


@app.get("/movies/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")
    return movie


@app.put("/movies/{movie_id}", response_model=MovieResponse)
def update_movie(movie_id: int, payload: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    movie.title = payload.title
    movie.genre = payload.genre
    movie.year = payload.year
    movie.director = payload.director

    db.commit()
    db.refresh(movie)
    return movie


@app.delete("/movies/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    db.delete(movie)
    db.commit()
    return None
