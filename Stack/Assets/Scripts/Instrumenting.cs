using System;
using System.Collections.Generic;
using UnityEngine;

public class Instrumenting : MonoBehaviour 
{
    public Difficulty difficulty;

    float screenWidth;
    float originalWidth;

    List<long> dropTimes = new List<long>();
    List<float> dropXs = new List<float>();
    List<float> dropWidths = new List<float>();
    List<int> dropDifficulties = new List<int>();


    void Start()
    {
        screenWidth = Camera.main.ScreenToWorldPoint(new Vector3(Screen.width, 0, 0)).x;
        originalWidth = GameObject.Find("Moving platform").GetComponent<SpriteRenderer>().bounds.size.x;

        Record(0, originalWidth);  // record start
        Application.ExternalCall("gameLoaded");
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.X))
            ReportGame(earlyExit: true);
    }

    long UnixTimeNow()
    {
        var timeSpan = (DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0));
        return (long)timeSpan.TotalMilliseconds;
    }

    public void Record(float x, float width)
    {
        dropTimes.Add(UnixTimeNow());
        dropDifficulties.Add(difficulty.amount);

        dropXs.Add(x / screenWidth);
        dropWidths.Add(width / originalWidth);
    }

    public void ReportGame(bool earlyExit=false)
    {
        Application.ExternalCall("gameOver", new object[] {
            dropTimes.ToArray(),  // the total time is difference between the last and the first
            dropXs.ToArray(),
            dropWidths.ToArray(),  // for convenience
            dropDifficulties.ToArray(),
            // the total score is the amount of items
            earlyExit
        });
    }

    // external
    public void SetKeyboardCapture(int status) {
        WebGLInput.captureAllKeyboardInput = (status == 1);
    }
}
