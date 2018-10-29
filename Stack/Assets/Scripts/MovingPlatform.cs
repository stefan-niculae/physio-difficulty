using UnityEngine;
using UnityEngine.SceneManagement;

public class MovingPlatform : MonoBehaviour {

    public float fallSpeed = 10;

    public GameObject dropTop;
    public GameObject chunkPrefab;
    public Score score;
    public Difficulty difficulty;
    public Instrumenting instrumenting;

    public float dropPadding = .03f;
    public float spawnOffset = .1f;

    enum State { Moving, Dropping, Dropped };
    State currentState = State.Moving;
    bool lastOne;

    int direction = 1;
    float dropY;

    Vector3 spriteSize;
    float scaleCoeff;

    Vector3 newSize;
    float fallingOver;
    float screenWidth;

    void Start()
    {
        spriteSize = GetComponent<SpriteRenderer>().bounds.size;
        scaleCoeff = transform.localScale.x / spriteSize.x;
        screenWidth = Camera.main.ScreenToWorldPoint(
            new Vector3(Screen.width, 0, 0)).x;
    }


    void Update ()
    {
        // Constant lateral moving
        if (currentState == State.Moving)
        {
            float maxPoint = (screenWidth - spriteSize.x / 2);
            if (Mathf.Abs(transform.position.x) >= maxPoint)  // switch direction
                direction *= -1;
            MoveTo(x: direction * maxPoint, speed: difficulty.platformSpeed);

            if (Input.GetKeyDown(KeyCode.Space))
                StartDropping();
        }

        // Falling
        if (currentState == State.Dropping)
        {
            MoveTo(y: dropY, speed: fallSpeed);
            if (transform.position.y <= dropY)
                ReachBase();
        }

        // Restart
        if (currentState == State.Dropped && lastOne && Input.GetKeyDown(KeyCode.Space))
            RestartGame();
    }


    private void MoveTo(float? x = null, float? y = null, float? speed = null)
    {
        Vector2 current = transform.position;
        Vector2 target = new Vector2(
            x ?? current.x,
            y ?? current.y
        );
        transform.position = Vector2.MoveTowards(current, target,
                                                 (speed ?? 1) * Time.deltaTime);
    }


    void StartDropping()
    {
        dropY = dropTop.transform.position.y +
                spriteSize.y +
                dropPadding;
        currentState = State.Dropping;

        fallingOver = this.transform.position.x - dropTop.transform.position.x;
        newSize = transform.localScale;
        newSize.x -= Mathf.Abs(fallingOver) * scaleCoeff;
        newSize.x = Mathf.Max(0, newSize.x);

        // Instrumenting
        instrumenting.Record(transform.position.x, newSize.x / scaleCoeff);

        // TODO if falling too close (remaining platform would be too small)
        if (Mathf.Abs(fallingOver) >= transform.localScale.x / scaleCoeff) 
        {
            lastOne = true;
            Camera.main.GetComponent<Follow>().enabled = false;
        }
        else
            SpawnNext();
    }


    void SpawnNext()
    {
        float x = screenWidth + spriteSize.x / 2 + spawnOffset;  // spawn offscreen
        x *= direction;

        float y = dropY + difficulty.platformDistance;

        GameObject newPlatform = Instantiate(
            this.gameObject,
            position: new Vector3(x, y),
            rotation: Quaternion.identity
        );

        newPlatform.GetComponent<MovingPlatform>().dropTop = this.gameObject;
        newPlatform.transform.localScale = newSize;

        Camera.main.GetComponent<Follow>().target = newPlatform;
    }

    void ReachBase()
    {
        currentState = State.Dropped;

        if (lastOne)  // game over
        {
            GetComponent<SpriteRenderer>().color = Color.red;
            instrumenting.ReportGame();
            return;
        }

        currentState = State.Dropped;
        score.amount += 1;

        transform.localScale = newSize;

        Vector3 position = transform.position;
        position.x -= fallingOver / 2;
        transform.position = position;

        CreateChunk();
    }

    void CreateChunk()
    {
        GameObject chunk = Instantiate(chunkPrefab);
        Vector3 chunkSize = chunk.transform.localScale;
        chunkSize.x = fallingOver * scaleCoeff;
        chunk.transform.localScale = chunkSize;

        Vector3 chunkPosition = this.transform.position;
        chunkPosition.x += spriteSize.x / 2 * Mathf.Sign(fallingOver);
        chunk.transform.position = chunkPosition;
    }

    // also external
    public void RestartGame() {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
}
